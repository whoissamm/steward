"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { dialectify } from "@/lib/dialect"

type SpeechRecognitionLike = {
  lang: string
  interimResults: boolean
  continuous: boolean
  onresult: ((ev: { results: { 0: { transcript: string } }[] }) => void) | null
  onerror: ((ev: { error: string }) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

function getBrowserSTT(): SpeechRecognitionLike | null {
  if (typeof window === "undefined") return null
  const win = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike
    webkitSpeechRecognition?: new () => SpeechRecognitionLike
  }
  const Ctor = win.SpeechRecognition || win.webkitSpeechRecognition
  return Ctor ? new Ctor() : null
}

export function isVoiceSupported(): boolean {
  if (typeof window === "undefined") return false
  const win = window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }
  return !!(win.SpeechRecognition || win.webkitSpeechRecognition)
}

export function useAudio(accent: string, readAloud: boolean) {
  const [listening, setListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [audioLevel, setAudioLevel] = useState(0)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)

  const cleanupStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    setAudioLevel(0)
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {})
      audioCtxRef.current = null
    }
    analyserRef.current = null
    recognitionRef.current = null
  }, [])

  useEffect(() => () => cleanupStream(), [cleanupStream])

  const startWaveform = useCallback((stream: MediaStream) => {
    const win = window as unknown as { webkitAudioContext?: typeof AudioContext }
    const Ctor = window.AudioContext || win.webkitAudioContext
    if (!Ctor) return
    const ctx = new Ctor()
    audioCtxRef.current = ctx
    const source = ctx.createMediaStreamSource(stream)
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 256
    source.connect(analyser)
    analyserRef.current = analyser
    const data = new Uint8Array(analyser.frequencyBinCount)
    const loop = () => {
      if (!analyserRef.current) return
      analyserRef.current.getByteFrequencyData(data)
      const avg = data.reduce((a, b) => a + b, 0) / data.length / 255
      setAudioLevel(avg)
      rafRef.current = requestAnimationFrame(loop)
    }
    loop()
  }, [])

  const listen = useCallback(
    async (onTranscript: (text: string) => void): Promise<void> => {
      setError(null)
      const rec = getBrowserSTT()
      if (!rec) {
        setError("Voice not supported on this browser. Please type your question.")
        return
      }
      rec.lang = "en-GB"
      rec.interimResults = false
      rec.continuous = false
      rec.onresult = (ev) => {
        const t = ev.results[0][0].transcript
        if (t) onTranscript(t)
      }
      rec.onerror = (ev) => {
        const map: Record<string, string> = {
          "not-allowed": "Microphone permission denied. Enable it in browser settings.",
          "no-speech": "Didn't catch that — try again.",
          network: "Voice service unreachable. Try again in a moment.",
        }
        setError(map[ev.error] ?? `Voice error: ${ev.error}`)
      }
      rec.onend = () => {
        setListening(false)
        cleanupStream()
      }
      recognitionRef.current = rec
      setListening(true)
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        streamRef.current = stream
        startWaveform(stream)
      } catch (e) {
        setError(`Microphone unavailable: ${(e as Error).message}`)
      }
      try {
        rec.start()
      } catch (e) {
        setListening(false)
        setError(`Could not start voice: ${(e as Error).message}`)
      }
    },
    [cleanupStream, startWaveform],
  )

  const stop = useCallback(() => {
    try {
      recognitionRef.current?.stop()
    } catch {
      // ignore
    }
    cleanupStream()
    setListening(false)
  }, [cleanupStream])

  const speak = useCallback(
    (text: string) => {
      if (!readAloud) return
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return
      const voiced = dialectify(text, accent)
      const utter = new SpeechSynthesisUtterance(voiced)
      utter.lang = "en-GB"
      utter.rate = 1
      utter.pitch = 1
      window.speechSynthesis.cancel()
      try {
        window.speechSynthesis.speak(utter)
      } catch (e) {
        setError(`Could not read aloud: ${(e as Error).message}`)
      }
    },
    [accent, readAloud],
  )

  const clearError = useCallback(() => setError(null), [])

  return { listening, listen, stop, speak, error, clearError, audioLevel }
}

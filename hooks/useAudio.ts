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

export function useAudio(accent: string, readAloud: boolean, gender: "male" | "female" = "male") {
  const [listening, setListening] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [audioLevel, setAudioLevel] = useState(0)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const currentAudioRef = useRef<HTMLAudioElement | null>(null)
  const currentUrlRef = useRef<string | null>(null)
  const speakSeqRef = useRef(0)

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

  const stopSpeaking = useCallback(() => {
    // Stop ElevenLabs audio
    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.pause()
        currentAudioRef.current.src = ""
      } catch {
        // ignore
      }
      currentAudioRef.current = null
    }
    if (currentUrlRef.current) {
      URL.revokeObjectURL(currentUrlRef.current)
      currentUrlRef.current = null
    }
    // Stop browser TTS
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel()
      } catch {
        // ignore
      }
    }
    setSpeaking(false)
  }, [])

  useEffect(() => () => {
    cleanupStream()
    stopSpeaking()
  }, [cleanupStream, stopSpeaking])

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
    async (text: string) => {
      if (!readAloud || typeof window === "undefined") return
      // Always cancel anything currently speaking before starting a new one
      stopSpeaking()
      const seq = ++speakSeqRef.current
      try {
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, accent, gender }),
        })
        // If a newer speak() has been requested since we started, bail out
        if (seq !== speakSeqRef.current) return
        const ctype = res.headers.get("content-type") || ""
        if (res.ok && ctype.includes("audio/")) {
          const blob = await res.blob()
          if (seq !== speakSeqRef.current) return
          const url = URL.createObjectURL(blob)
          currentUrlRef.current = url
          const audio = new Audio(url)
          currentAudioRef.current = audio
          setSpeaking(true)
          const cleanup = () => {
            if (currentUrlRef.current === url) {
              URL.revokeObjectURL(url)
              currentUrlRef.current = null
            }
            if (currentAudioRef.current === audio) currentAudioRef.current = null
            setSpeaking(false)
          }
          audio.onended = cleanup
          audio.onerror = cleanup
          try {
            await audio.play()
          } catch (e) {
            cleanup()
            setError(`Playback blocked: ${(e as Error).message}. Tap the speaker button to enable audio.`)
          }
          return
        }
        // JSON fallback = browser TTS with dialectified text
        const data = (await res.json().catch(() => null)) as { dialect_text?: string } | null
        if (!("speechSynthesis" in window)) return
        if (seq !== speakSeqRef.current) return
        const utter = new SpeechSynthesisUtterance(data?.dialect_text || dialectify(text, accent))
        utter.lang = "en-GB"
        utter.rate = 1
        utter.pitch = 1
        setSpeaking(true)
        utter.onend = () => setSpeaking(false)
        utter.onerror = () => setSpeaking(false)
        window.speechSynthesis.cancel()
        window.speechSynthesis.speak(utter)
      } catch (e) {
        setError(`Could not read aloud: ${(e as Error).message}`)
      }
    },
    [accent, readAloud, stopSpeaking],
  )

  const clearError = useCallback(() => setError(null), [])

  return { listening, speaking, listen, stop, speak, stopSpeaking, error, clearError, audioLevel }
}

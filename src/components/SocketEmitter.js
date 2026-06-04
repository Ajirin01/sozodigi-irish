"use client";
import { useEffect } from "react";
import useSocketEmitOnline from "@/hooks/useSocketEmitOnline";

export default function SocketEmitter() {
  useSocketEmitOnline();
  return null;
}

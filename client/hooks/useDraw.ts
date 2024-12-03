import {useEffect, useRef, useState} from "react";

export const useDraw = (onDraw: ({ctx, currentPoint, prevPoint}: Draw) => void) => {

  const [mouseDown, setMouseDown] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const prevPoint = useRef<Point | null>(null);

  const onMouseDown = () => setMouseDown(true)

  const clear = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!mouseDown) return;

      const currentPoint = computePointInCanvas(e)

      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx || !currentPoint) return

      onDraw({ctx, currentPoint, prevPoint: prevPoint.current})
      prevPoint.current = currentPoint
    }

    const computePointInCanvas = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      return {x, y}
    }

    const mouseUpHandler = () => {
      setMouseDown(false)
      prevPoint.current = null
    }

    canvasRef.current?.addEventListener('mousemove', handler)
    window.addEventListener('mouseup', mouseUpHandler)

    return () => {
      canvasRef.current?.removeEventListener('mousemove', handler)
      window.removeEventListener('mouseup', mouseUpHandler)
    }
  }, [onDraw])

  return {canvasRef, onMouseDown, clear}
}

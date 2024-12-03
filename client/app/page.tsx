'use client'

import {ChromePicker} from 'react-color'
import {useDraw} from "@/hooks/useDraw";
import {FC, useEffect, useState} from "react";
import {drawLine} from '@/utils/drawLine'
import {io} from "socket.io-client";

const socket = io('http://localhost:3001');

type pageProps = object

type DrawLineProps = {
  prevPoint: Point | null
  currentPoint: Point
  color: string,
  lineWidth: number
}

const Page: FC<pageProps> = ({}) => {
  const [color, setColor] = useState<string>('#000')
  const {canvasRef, onMouseDown, clear} = useDraw(createLine)
  const [lineWidth, setLineWidth] = useState(5)

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d')

    socket.emit('client-ready')

    socket.on('get-canvas-state', () => {
      if (!canvasRef.current?.toDataURL()) return
      console.log('sending canvas state')
      socket.emit('canvas-state', canvasRef.current.toDataURL())
    })

    socket.on('canvas-state-from-server', (state: string) => {
      console.log('I received the state')
      const img = new window.Image()
      img.src = state
      img.onload = () => {
        ctx?.drawImage(img, 0, 0)
      }
    })

    socket.on('draw-line', ({prevPoint, currentPoint, color, lineWidth}: DrawLineProps) => {
      if (!ctx) return console.log('no ctx here')
      drawLine({prevPoint, currentPoint, ctx, color, lineWidth})
    })

    socket.on('clear', clear)

    return () => {
      socket.off('draw-line')
      socket.off('get-canvas-state')
      socket.off('canvas-state-from-server')
      socket.off('clear')
    }
  }, [canvasRef])

  function createLine({prevPoint, currentPoint, ctx}: Draw) {
    socket.emit('draw-line', {prevPoint, currentPoint, color, lineWidth})
    drawLine({prevPoint, currentPoint, ctx, color, lineWidth})
  }

  function saveCanvas() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (!canvas || !ctx) return;

    // Create a temporary canvas with a white background
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');

    if (tempCtx) {
      // Fill with white background
      tempCtx.fillStyle = 'white';
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

      // Draw the original canvas content on top
      tempCtx.drawImage(canvas, 0, 0);

      // Convert to data URL and trigger download
      const createEl = document.createElement('a');
      createEl.href = tempCanvas.toDataURL("image/jpeg", 0.9);
      createEl.download = "this-canvas.jpg";
      createEl.click();
      createEl.remove();
    }
  }


  return (
    <div className="w-screen h-screen flex justify-between align-center bg-gradient-to-r from-blue-200 to-cyan-200">
      <div className='flex flex-col gap-6 pr-10  text-slate-950 p-2 shadow-2xl'>
        <h2 className='text-xl text-center'>Collab Paint</h2>
        <ChromePicker color={color} onChange={(e) => setColor(e.hex)}/>
        <div className="input-wrapper">
          <label htmlFor="lineWidth">Line Width: </label>
          <input type="number" name="lineWidth" value={lineWidth} onChange={e => setLineWidth(Number(e.target.value))}
                 className='p-0.5 rounded-md border border-black w-16 bg-transparent pl-3'/>
        </div>
        <button className='px-2 py-1 rounded-md border border-black' onClick={saveCanvas}>Save</button>
        <button
          type='button'
          className='px-2 py-1 rounded-md border border-black mt-auto'
          onClick={() => socket.emit('clear')}>
          Clear canvas
        </button>
      </div>

      <canvas
        onMouseDown={onMouseDown}
        ref={canvasRef}
        width={750}
        height={750}
        className='border-2 border-gray-500 rounded-md w-3/4 m-auto h-[95%] shadow-2xl'>

      </canvas>
    </div>
  );
};

export default Page;

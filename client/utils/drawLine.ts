type DrawLineProps = Draw & {
  color: string;
  lineWidth: number
}

export const drawLine = ({prevPoint, currentPoint, ctx, color, lineWidth}: DrawLineProps) => {
  const {x: currX, y: currY} = currentPoint;
  const lineColor = color;
  const lineW = lineWidth;
  const startPoint = prevPoint ?? currentPoint;

  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  // ctx.globalAlpha = 0.9;


  ctx.beginPath();
  ctx.lineWidth = lineW;
  ctx.strokeStyle = lineColor;
  ctx.moveTo(startPoint.x, startPoint.y);
  ctx.lineTo(currX, currY);
  ctx.stroke()

  const distance = Math.sqrt(
    (currX - startPoint.x) ** 2 + (currY - startPoint.y) ** 2
  );
  const angle = Math.atan2(currY - startPoint.y, currX - startPoint.x);

  for (let i = 0; i < distance; i += lineWidth / 4) {
    const x = startPoint.x + Math.cos(angle) * i;
    const y = startPoint.y + Math.sin(angle) * i;
    ctx.beginPath();
    ctx.arc(x, y, lineWidth / 2, 0, 2 * Math.PI);
    ctx.fillStyle = lineColor;
    ctx.fill();
  }
}

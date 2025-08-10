"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const SHAPE_COUNT = 100;
const COLOR_CHANGE_INTERVAL = 1000; // 1 second

export default function Street() {
  const [shapes, setShapes] = useState([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const animationRef = useRef();
  const lastTimeRef = useRef(0);
  const colorChangeRef = useRef(0);

  // Generate random color
  const getRandomColor = useCallback(() => {
    const colors = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#96CEB4",
      "#FFEAA7",
      "#DDA0DD",
      "#98D8C8",
      "#F7DC6F",
      "#BB8FCE",
      "#85C1E9",
      "#F8C471",
      "#82E0AA",
      "#F1948A",
      "#85C1E9",
      "#D7BDE2",
      "#FF9FF3",
      "#54A0FF",
      "#5F27CD",
      "#00D2D3",
      "#FF9F43",
      "#EE5A24",
      "#0ABDE3",
      "#10AC84",
      "#F79F1F",
      "#A3CB38",
      "#FDA7DF",
      "#D63031",
      "#74B9FF",
      "#A29BFE",
      "#6C5CE7",
      "#FD79A8",
      "#E17055",
      "#00B894",
      "#FDCB6E",
      "#E84393",
      "#00CEC9",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }, []);

  // Handle shape click
  const handleShapeClick = useCallback((shapeId) => {
    setShapes((prevShapes) =>
      prevShapes.map((shape) =>
        shape.id === shapeId
          ? {
              ...shape,
              isPaused: !shape.isPaused,
              pausedTime: !shape.isPaused ? 0 : undefined, // 정지 시 시간 초기화, 재개 시 undefined
              shrinkScale: 1, // 크기 스케일 초기화
            }
          : shape
      )
    );
  }, []);

  // Initialize shapes
  const initializeShapes = useCallback(() => {
    const newShapes = [];
    for (let i = 0; i < SHAPE_COUNT; i++) {
      const size = Math.random() * 90 + 10; // 10px to 100px
      const shape = {
        id: i,
        x: Math.random() * (dimensions.width - size),
        y: Math.random() * (dimensions.height - size),
        vx: (Math.random() - 0.5) * 2, // Random direction
        vy: (Math.random() - 0.5) * 2,
        size,
        originalSize: size, // 원래 크기 저장
        speed: Math.random() * 40 + 10, // 10px/s to 50px/s
        type: ["circle", "square", "triangle"][Math.floor(Math.random() * 3)],
        color: getRandomColor(),
        colorTarget: getRandomColor(),
        colorProgress: 0,
        isPaused: false,
        pausedTime: undefined, // 정지된 시간 추적
        shrinkScale: 1, // 축소 스케일
      };
      newShapes.push(shape);
    }
    setShapes(newShapes);
  }, [dimensions, getRandomColor]);

  // Handle window resize
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Initialize shapes when dimensions are available
  useEffect(() => {
    if (dimensions.width > 0 && dimensions.height > 0) {
      initializeShapes();
    }
  }, [dimensions, initializeShapes]);

  // Lock page scroll while this component is mounted
  useEffect(() => {
    const htmlStyle = document.documentElement.style;
    const bodyStyle = document.body.style;
    const prevHtmlOverflow = htmlStyle.overflow;
    const prevBodyOverflow = bodyStyle.overflow;

    htmlStyle.overflow = "hidden";
    bodyStyle.overflow = "hidden";

    return () => {
      htmlStyle.overflow = prevHtmlOverflow;
      bodyStyle.overflow = prevBodyOverflow;
    };
  }, []);

  // Collision detection
  const checkCollision = (shape1, shape2) => {
    const size1 = shape1.originalSize * shape1.shrinkScale;
    const size2 = shape2.originalSize * shape2.shrinkScale;
    const dx = shape1.x + size1 / 2 - (shape2.x + size2 / 2);
    const dy = shape1.y + size1 / 2 - (shape2.y + size2 / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (size1 + size2) / 2;
  };

  // Handle collision response
  const handleCollision = (shape1, shape2) => {
    const size1 = shape1.originalSize * shape1.shrinkScale;
    const size2 = shape2.originalSize * shape2.shrinkScale;
    const dx = shape1.x + size1 / 2 - (shape2.x + size2 / 2);
    const dy = shape1.y + size1 / 2 - (shape2.y + size2 / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return;

    // Normalize collision vector
    const nx = dx / distance;
    const ny = dy / distance;

    // Relative velocity
    const dvx = shape1.vx - shape2.vx;
    const dvy = shape1.vy - shape2.vy;

    // Relative velocity in collision normal direction
    const dvn = dvx * nx + dvy * ny;

    // Do not resolve if velocities are separating
    if (dvn > 0) return;

    // Collision impulse
    const impulse = (2 * dvn) / 2; // Assuming equal mass

    // Update velocities (정지된 도형은 속도 변경하지 않음)
    if (!shape1.isPaused) {
      shape1.vx -= impulse * nx;
      shape1.vy -= impulse * ny;
    }
    if (!shape2.isPaused) {
      shape2.vx += impulse * nx;
      shape2.vy += impulse * ny;
    }
  };

  // Interpolate between colors
  const interpolateColor = (color1, color2, progress) => {
    const hex1 = color1.replace("#", "");
    const hex2 = color2.replace("#", "");

    const r1 = Number.parseInt(hex1.substr(0, 2), 16);
    const g1 = Number.parseInt(hex1.substr(2, 2), 16);
    const b1 = Number.parseInt(hex1.substr(4, 2), 16);

    const r2 = Number.parseInt(hex2.substr(0, 2), 16);
    const g2 = Number.parseInt(hex2.substr(2, 2), 16);
    const b2 = Number.parseInt(hex2.substr(4, 2), 16);

    const r = Math.round(r1 + (r2 - r1) * progress);
    const g = Math.round(g1 + (g2 - g1) * progress);
    const b = Math.round(b1 + (b2 - b1) * progress);

    return `rgb(${r}, ${g}, ${b})`;
  };

  // Animation loop
  const animate = useCallback(
    (currentTime) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = currentTime;
      }

      const deltaTime = (currentTime - lastTimeRef.current) / 1000; // Convert to seconds
      lastTimeRef.current = currentTime;

      colorChangeRef.current += deltaTime * 1000;

      setShapes((prevShapes) => {
        const newShapes = prevShapes
          .map((shape) => {
            const newShape = { ...shape };

            // Update position (정지된 도형은 위치 업데이트 건너뛰기)
            if (!newShape.isPaused) {
              const currentSize = newShape.originalSize * newShape.shrinkScale;
              newShape.x += newShape.vx * newShape.speed * deltaTime;
              newShape.y += newShape.vy * newShape.speed * deltaTime;

              // Boundary wrapping (화면 밖으로 나가면 반대편에서 나타남)
              if (newShape.x < -currentSize) {
                newShape.x = dimensions.width;
              } else if (newShape.x > dimensions.width) {
                newShape.x = -currentSize;
              }

              if (newShape.y < -currentSize) {
                newShape.y = dimensions.height;
              } else if (newShape.y > dimensions.height) {
                newShape.y = -currentSize;
              }
            } else {
              // 정지된 도형의 시간 추적 및 축소 효과
              if (newShape.pausedTime !== undefined) {
                newShape.pausedTime += deltaTime;

                // 2초 후부터 0.5초마다 10%씩 축소
                if (newShape.pausedTime >= 2) {
                  const shrinkIntervals = Math.floor(
                    (newShape.pausedTime - 2) / 0.5
                  );
                  newShape.shrinkScale = Math.max(0, 1 - shrinkIntervals * 0.1);
                }
              }
            }

            // Update color transition - 정지된 도형도 색상은 계속 변화
            newShape.colorProgress += deltaTime;
            if (newShape.colorProgress >= 1) {
              newShape.color = newShape.colorTarget;
              newShape.colorTarget = getRandomColor();
              newShape.colorProgress = 0;
            }

            return newShape;
          })
          .filter((shape) => shape.shrinkScale > 0.05); // 크기가 5% 이하로 작아지면 제거

        // Reset color change timer
        if (colorChangeRef.current >= COLOR_CHANGE_INTERVAL) {
          colorChangeRef.current = 0;
        }

        // Handle collisions (사라지지 않은 도형들만)
        for (let i = 0; i < newShapes.length; i++) {
          for (let j = i + 1; j < newShapes.length; j++) {
            if (checkCollision(newShapes[i], newShapes[j])) {
              handleCollision(newShapes[i], newShapes[j]);
            }
          }
        }

        return newShapes;
      });

      animationRef.current = requestAnimationFrame(animate);
    },
    [dimensions, getRandomColor]
  );

  // Start animation
  useEffect(() => {
    if (shapes.length > 0) {
      animationRef.current = requestAnimationFrame(animate);
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [shapes.length, animate]);

  // Render shape based on type
  const renderShape = (shape) => {
    const currentColor =
      shape.colorProgress > 0
        ? interpolateColor(shape.color, shape.colorTarget, shape.colorProgress)
        : shape.color;

    const currentSize = shape.originalSize * shape.shrinkScale;
    const isDisappearing = shape.isPaused && shape.pausedTime >= 2;

    const style = {
      position: "absolute",
      left: shape.x,
      top: shape.y,
      width: currentSize,
      height: currentSize,
      background: `linear-gradient(45deg, ${currentColor}, ${currentColor}dd)`,
      transition: "none",
      boxShadow: shape.isPaused
        ? `0 0 ${currentSize / 2}px ${currentColor}, 0 0 ${currentSize}px ${currentColor}44`
        : `0 0 ${currentSize / 4}px ${currentColor}44`,
      cursor: "pointer",
      pointerEvents: "auto",
      opacity: isDisappearing
        ? shape.shrinkScale * 0.8
        : shape.isPaused
          ? 0.8
          : 1,
      transform: `scale(${shape.isPaused && !isDisappearing ? 1.1 : 1})`,
    };

    const handleClick = (e) => {
      e.stopPropagation();
      handleShapeClick(shape.id);
    };

    switch (shape.type) {
      case "circle":
        return (
          <div
            key={shape.id}
            onClick={handleClick}
            style={{
              ...style,
              borderRadius: "50%",
            }}
          />
        );
      case "square":
        return (
          <div
            key={shape.id}
            onClick={handleClick}
            style={{
              ...style,
              borderRadius: "8px",
            }}
          />
        );
      case "triangle":
        return (
          <div
            key={shape.id}
            onClick={handleClick}
            style={{
              ...style,
              background: "transparent",
              width: 0,
              height: 0,
              borderLeft: `${currentSize / 2}px solid transparent`,
              borderRight: `${currentSize / 2}px solid transparent`,
              borderBottom: `${currentSize}px solid ${currentColor}`,
              filter: shape.isPaused
                ? `drop-shadow(0 0 ${currentSize / 2}px ${currentColor}) drop-shadow(0 0 ${currentSize}px ${currentColor}44)`
                : `drop-shadow(0 0 ${currentSize / 4}px ${currentColor}44)`,
            }}
          />
        );
      default:
        return null;
    }
  };

  const pausedCount = shapes.filter((shape) => shape.isPaused).length;
  const disappearingCount = shapes.filter(
    (shape) => shape.isPaused && shape.pausedTime >= 2
  ).length;

  return (
    <div className="absolute inset-0 w-[100svw] h-[100svh] bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 overflow-hidden">
      <div>
        {/* <div className="z-10">
          <h1>이야아아</h1>
        </div> */}
        <div className="absolute inset-0 z-0 flex items-center justify-center">
          <video
            src="/mov/start_street.MOV"
            autoPlay
            loop
            muted
            playsInline
            className="inset-0 w-full h-full object-cover block max-w-none z-0"
          />
        </div>
      </div>

      {/* Artistic background pattern */}
      <div className="relative inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500 rounded-full blur-3xl" />
      </div>

      {/* Shapes */}
      {shapes.map(renderShape)}
    </div>
  );
}

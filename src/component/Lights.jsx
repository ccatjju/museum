import React, { useState } from "react";
import "./Lights.css";

export default function Lights() {
  // 10개의 박스를 랜덤 생성
  const [boxes] = useState(
    Array.from({ length: 250 }, (_, i) => {
      // 크기: 50px ~ 100px
      const size = 10 + Math.random() * 50;
      // left, top: 박스가 뷰포트 밖으로 나가지 않도록 계산
      const maxLeft = 100 - (size / window.innerWidth) * 100;
      const maxTop = 100 - (size / window.innerHeight) * 100;
      const duration = (1 + Math.random() * (10 - 1.5)).toFixed(2) + "s";
      return {
        id: i,
        size: `${size}px`,
        left: `${Math.random() * maxLeft}vw`,
        top: `${Math.random() * maxTop}vh`,
        duration,
      };
    })
  );

  return (
    <div className="main">
      {boxes.map((box) => (
        <div key={box.id} className="basic box1">
          <div
            className="point"
            style={{
              left: box.left,
              top: box.top,
              width: box.size,
              height: box.size,
              animation: `basicGrow ${box.duration} ease-in-out infinite`,
            }}
          ></div>
        </div>
      ))}

      {/* 기존 비디오 블록은 그대로 유지 */}
      <div className="basic box2">
        <video src="/mov/IMG_1.MOV" controls autoPlay loop muted />
        <video src="/mov/IMG_2.MOV" controls autoPlay loop muted />
        <video src="/mov/IMG_3.MOV" controls autoPlay loop muted />
        <video src="/mov/IMG_4.MOV" controls autoPlay loop muted />
      </div>
    </div>
  );
}

// src/component/Test.jsx
import { useEffect, useState } from "react";

export default function Test({
  text = "향기로운꽃은늠름하게핀다",
  intervalMs = 500,
  fontClass = "text-[7.5rem] md:text-[9rem]",
}) {
  const [idx, setIdx] = useState(0);
  const [hue, setHue] = useState(0);
  const [pos, setPos] = useState(() => randPos()); // { x(vw), y(vh) }

  function randPos() {
    // 화면 밖으로 안 나가게 10~90 구간에서 랜덤
    return { x: Math.random() * 80 + 10, y: Math.random() * 80 + 10 };
  }

  useEffect(() => {
    if (!text?.length) return;

    const id = setInterval(() => {
      setIdx((prev) => {
        const next = (prev + 1) % text.length;
        // 모든 글자를 다 보여준 뒤(다음이 0일 때) 새 위치로 이동
        if (next === 0) setPos(randPos());
        return next;
      });
      // 색상은 매틱마다 바뀜 (HSL의 H 회전)
      setHue((h) => (h + 47) % 360);
    }, intervalMs);

    return () => clearInterval(id);
  }, [text, intervalMs]);

  return (
    <div className="fixed inset-0 overflow-hidden">
      <div
        // transform으로만 위치를 옮겨서 부드럽게 보이도록 함
        className="absolute transition-transform duration-500 will-change-transform"
        style={{
          transform: `translate(${pos.x}vw, ${pos.y}vh)`,
        }}
      >
        <span
          className="select-none drop-shadow"
          style={{
            color: `hsl(${hue}, 85%, 60%)`,
            // 크기/굵기 강제 적용 (외부 CSS가 있어도 우선 적용)
            fontSize: "8rem", // 필요시 조정: 'clamp(4rem, 12vw, 10rem)'
            lineHeight: 1,
            fontWeight: 900,
          }}
        >
          {text[idx]}
        </span>
      </div>
    </div>
  );
}

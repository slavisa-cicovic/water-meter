import { useState } from "react";
import TextRecognition from "@react-native-ml-kit/text-recognition";
import * as ImageManipulator from "expo-image-manipulator";

type Frame = { left: number; top: number; width: number; height: number };

export type OcrBox = {
  id: string;
  text: string;
  value: number;
  frame: Frame;
};

export type OcrCandidate = {
  id: string;
  text: string;
  value: number | null;
};

const normalizeText = (text: string) =>
  text
    .replace(/[^\d.,]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const parseMeterValue = (text: string): number | null => {
  const clean = normalizeText(text);
  const compact = clean.replace(/\s+/g, "");
  const compactMatch = compact.match(/(\d{4,5})[.,](\d{2,3})/);
  if (compactMatch) {
    const rawWhole = compactMatch[1];
    const decimalsRaw = compactMatch[2];
    const whole = Number(rawWhole.length === 4 ? `0${rawWhole}` : rawWhole);
    if (Number.isFinite(whole)) {
      if (decimalsRaw.length >= 3) {
        const decimals = Number(decimalsRaw.slice(0, 3));
        if (Number.isFinite(decimals)) {
          return Math.round((whole + decimals / 1000) * 100) / 100;
        }
      }
      if (decimalsRaw.length >= 2) {
        const decimals = Number(decimalsRaw.slice(0, 2));
        if (Number.isFinite(decimals)) {
          return whole + decimals / 100;
        }
      }
    }
  }

  const parts = clean.split(" ").filter(Boolean);

  // Expected: 02653 412 -> 02653.41 (rounded from 3 decimals)
  if (parts.length >= 2 && parts[0].length === 5) {
    const whole = Number(parts[0]);
    const decimalsRaw = parts[1];
    if (Number.isFinite(whole)) {
      if (decimalsRaw.length >= 3) {
        const decimals = Number(decimalsRaw.slice(0, 3));
        if (Number.isFinite(decimals)) {
          return Math.round((whole + decimals / 1000) * 100) / 100;
        }
      }
      if (decimalsRaw.length >= 2) {
        const decimals = Number(decimalsRaw.slice(0, 2));
        if (Number.isFinite(decimals)) {
          return whole + decimals / 100;
        }
      }
    }
  }

  // fallback: samo 5 cifara
  const match = clean.match(/\b\d{5}\b/);
  if (match) return Number(match[0]);

  return null;
};

const mapFrameFromRotation = (
  frame: Frame,
  rotation: 0 | 90 | 180 | 270,
  originalSize: { width: number; height: number }
) => {
  if (rotation === 0) return frame;
  const { width: originalWidth, height: originalHeight } = originalSize;
  if (rotation === 90) {
    return {
      left: frame.top,
      top: originalHeight - (frame.left + frame.width),
      width: frame.height,
      height: frame.width,
    };
  }
  if (rotation === 180) {
    return {
      left: originalWidth - (frame.left + frame.width),
      top: originalHeight - (frame.top + frame.height),
      width: frame.width,
      height: frame.height,
    };
  }
  return {
    left: originalWidth - (frame.top + frame.height),
    top: frame.left,
    width: frame.height,
    height: frame.width,
  };
};

export function useMeterOcr(previousPaidValue: number) {
  const [boxes, setBoxes] = useState<OcrBox[]>([]);
  const [candidates, setCandidates] = useState<OcrCandidate[]>([]);
  const [recognizing, setRecognizing] = useState(false);

  const recognize = async (
    uri: string,
    imageSize?: { width: number; height: number }
  ) => {
    setRecognizing(true);
    setBoxes([]);
    setCandidates([]);

    const process = async (imageUri: string, rotation: 0 | 90 | 180 | 270) => {
      const result = await TextRecognition.recognize(imageUri);

      const nextBoxes: OcrBox[] = [];
      const nextCandidates: OcrCandidate[] = [];

      result.blocks.forEach((block, bi) => {
        block.lines.forEach((line, li) => {
          if (!line.frame || !/\d/.test(line.text)) return;
          if (/^[A-Za-z]/.test(line.text.trim())) return;

          const value = parseMeterValue(line.text);
          const id = `${rotation}-${bi}-${li}`;

          nextCandidates.push({ id, text: line.text, value });

          if (value === null) return;

          const mappedFrame =
            imageSize && rotation !== 0
              ? mapFrameFromRotation(line.frame, rotation, imageSize)
              : line.frame;

          nextBoxes.push({
            id,
            text: line.text,
            value,
            frame: mappedFrame,
          });
        });
      });

      return { nextBoxes, nextCandidates };
    };

    try {
      let foundBoxes: OcrBox[] = [];
      let foundCandidates: OcrCandidate[] = [];

      // 1️⃣ original
      const base = await process(uri, 0);
      foundBoxes = base.nextBoxes;
      foundCandidates = base.nextCandidates;

      // 2️⃣ rotacije samo ako nema ništa
      if (!foundBoxes.length) {
        for (const rot of [90, 180, 270] as const) {
          const rotated = await ImageManipulator.manipulateAsync(
            uri,
            [{ rotate: rot }],
            { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
          );

          const r = await process(rotated.uri, rot);
          foundCandidates.push(...r.nextCandidates);
          if (r.nextBoxes.length) {
            foundBoxes = r.nextBoxes;
            break;
          }
        }
      }

      // heuristika: filtriraj
      const filtered = foundBoxes
        .filter(b => b.value > previousPaidValue)
        .filter(b => b.value < previousPaidValue + 10000)
        .sort((a, b) => {
          const areaA = a.frame.width * a.frame.height;
          const areaB = b.frame.width * b.frame.height;
          return areaB - areaA;
        });

      setBoxes(filtered);
      setCandidates(foundCandidates);

      return {
        best: filtered[0] ?? null,
        boxes: filtered,
        candidates: foundCandidates,
      };
    } catch (error) {
      console.log(".............................", JSON.stringify(error));
      return {
        best: null,
        boxes: [],
        candidates: [],
      };
    } finally {
      setRecognizing(false);
    }
  };

  return {
    recognize,
    recognizing,
    boxes,
    candidates,
  };
}

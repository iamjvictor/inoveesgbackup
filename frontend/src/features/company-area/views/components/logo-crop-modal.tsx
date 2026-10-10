"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  RefreshCw, 
  Move, 
  Check, 
  Loader2, 
  Sparkles,
  Building2,
  Crop
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface LogoCropModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  onClose: () => void;
  onConfirm: (croppedBase64: string) => Promise<void>;
  isUploading?: boolean;
}

export function LogoCropModal({
  isOpen,
  imageSrc,
  onClose,
  onConfirm,
  isUploading = false,
}: LogoCropModalProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageObjRef = useRef<HTMLImageElement | null>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const CROP_SIZE = 260; // Size of the square crop area in UI
  const CANVAS_SIZE = 320; // Overall viewport size

  // Reset transforms on new image
  useEffect(() => {
    if (imageSrc && isOpen) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageSrc;
      img.onload = () => {
        imageObjRef.current = img;
        setIsImageLoaded(true);
        setZoom(1);
        setRotation(0);
        setPosition({ x: 0, y: 0 });
      };
    } else {
      setIsImageLoaded(false);
      imageObjRef.current = null;
    }
  }, [imageSrc, isOpen]);

  // Draw main viewport canvas
  const drawMainCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageObjRef.current;
    if (!canvas || !img || !isImageLoaded) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    // Move origin to center of viewport
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    ctx.translate(centerX + position.x, centerY + position.y);
    ctx.rotate((rotation * Math.PI) / 180);

    // Calculate base scale to fit image decently within crop window
    const minDim = Math.min(img.width, img.height);
    const baseScale = CROP_SIZE / minDim;
    const scale = baseScale * zoom;

    ctx.scale(scale, scale);
    ctx.drawImage(img, -img.width / 2, -img.height / 2, img.width, img.height);
    ctx.restore();
  }, [position, rotation, zoom, isImageLoaded]);

  // Draw small real-time preview canvas (Avatar format: 512x512 rounded)
  const generateCroppedDataUrl = useCallback((): string | null => {
    const img = imageObjRef.current;
    if (!img || !isImageLoaded) return null;

    const OUTPUT_SIZE = 512;
    const offscreenCanvas = document.createElement("canvas");
    offscreenCanvas.width = OUTPUT_SIZE;
    offscreenCanvas.height = OUTPUT_SIZE;

    const ctx = offscreenCanvas.getContext("2d");
    if (!ctx) return null;

    // Fill background with white/transparent as clean canvas
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

    ctx.save();
    const centerX = OUTPUT_SIZE / 2;
    const centerY = OUTPUT_SIZE / 2;

    // Scale position offset to high-res output
    const factor = OUTPUT_SIZE / CROP_SIZE;
    ctx.translate(centerX + position.x * factor, centerY + position.y * factor);
    ctx.rotate((rotation * Math.PI) / 180);

    const minDim = Math.min(img.width, img.height);
    const baseScale = OUTPUT_SIZE / minDim;
    const scale = baseScale * zoom;

    ctx.scale(scale, scale);
    ctx.drawImage(img, -img.width / 2, -img.height / 2, img.width, img.height);
    ctx.restore();

    return offscreenCanvas.toDataURL("image/png");
  }, [position, rotation, zoom, isImageLoaded]);

  // Render continuous canvas updates
  useEffect(() => {
    if (isOpen && isImageLoaded) {
      drawMainCanvas();

      // Render live preview
      const previewCanvas = previewCanvasRef.current;
      if (previewCanvas) {
        const pCtx = previewCanvas.getContext("2d");
        const croppedUrl = generateCroppedDataUrl();
        if (pCtx && croppedUrl) {
          const previewImg = new Image();
          previewImg.src = croppedUrl;
          previewImg.onload = () => {
            pCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
            pCtx.drawImage(previewImg, 0, 0, previewCanvas.width, previewCanvas.height);
          };
        }
      }
    }
  }, [isOpen, isImageLoaded, drawMainCanvas, generateCroppedDataUrl]);

  // Mouse Drag Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch Handlers for Mobile Devices
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPosition({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  const handleSave = async () => {
    const croppedDataUrl = generateCroppedDataUrl();
    if (!croppedDataUrl) return;
    await onConfirm(croppedDataUrl);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-100/80 text-emerald-800 border border-emerald-200/60">
              <Crop className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg leading-tight flex items-center gap-2">
                Ajustar e Enquadrar Logo
              </h3>
              <p className="text-xs text-slate-500">
                Arraste, amplie e rotacione para definir o visual perfeito da sua empresa
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isUploading}
            className="p-2 rounded-full hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
            {/* Interactive Crop Viewport */}
            <div className="relative flex flex-col items-center">
              <div
                className="relative rounded-2xl overflow-hidden bg-slate-900 select-none cursor-grab active:cursor-grabbing shadow-inner border border-slate-800"
                style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {/* Main Canvas rendering image */}
                <canvas
                  ref={canvasRef}
                  width={CANVAS_SIZE}
                  height={CANVAS_SIZE}
                  className="block w-full h-full"
                />

                {/* Dark Mask with Circular/Square Crop Cutout */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  {/* Outer dark overlay */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: "rgba(15, 23, 42, 0.55)",
                    }}
                  />
                  {/* Crop Window Cutout */}
                  <div
                    className="relative z-10 rounded-2xl border-2 border-emerald-400 shadow-[0_0_0_9999px_rgba(15,23,42,0.6)]"
                    style={{
                      width: CROP_SIZE,
                      height: CROP_SIZE,
                    }}
                  >
                    {/* Grid Overlay Guide lines */}
                    <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-25">
                      <div className="border-r border-b border-white" />
                      <div className="border-r border-b border-white" />
                      <div className="border-b border-white" />
                      <div className="border-r border-b border-white" />
                      <div className="border-r border-b border-white" />
                      <div className="border-b border-white" />
                      <div className="border-r border-white" />
                      <div className="border-r border-white" />
                      <div />
                    </div>
                  </div>
                </div>

                {/* Drag Help Pill */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded-full bg-slate-950/80 text-[11px] font-medium text-white/90 backdrop-blur-md flex items-center gap-1.5 pointer-events-none shadow-sm">
                  <Move className="h-3 w-3 text-emerald-400" />
                  Clique e arraste para posicionar
                </div>
              </div>
            </div>

            {/* Live Preview Side Box */}
            <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200/80 w-full md:w-44 space-y-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">
                Pré-visualização
              </span>

              {/* Avatar Box (Match Header Preview) */}
              <div className="relative h-24 w-24 rounded-2xl overflow-hidden bg-slate-900 border-2 border-emerald-500 shadow-md flex items-center justify-center">
                <canvas
                  ref={previewCanvasRef}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              </div>

              <span className="text-[11px] text-slate-400 text-center leading-tight">
                Como ficará no cabeçalho e relatórios
              </span>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-4">
            {/* Zoom Slider */}
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 w-16">
                <ZoomIn className="h-4 w-4 text-emerald-600" />
                Zoom
              </span>
              <button
                onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
                className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                title="Diminuir Zoom"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="flex-1 accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
              <button
                onClick={() => setZoom((z) => Math.min(3, z + 0.1))}
                className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                title="Aumentar Zoom"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <span className="text-xs font-semibold text-slate-600 w-12 text-right">
                {Math.round(zoom * 100)}%
              </span>
            </div>

            {/* Rotation & Reset Preset Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRotate}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <RotateCw className="h-3.5 w-3.5 text-emerald-600" />
                  Girar 90°
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
                  Resetar
                </button>
              </div>

              {/* Quick Zoom Presets */}
              <div className="flex items-center gap-1">
                {[1, 1.5, 2].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setZoom(preset)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      Math.abs(zoom - preset) < 0.05
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200"
                    }`}
                  >
                    {preset * 100}%
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isUploading}
            className="rounded-xl font-semibold border-slate-300 text-slate-700 hover:bg-slate-100"
          >
            Cancelar
          </Button>

          <Button
            type="button"
            onClick={handleSave}
            disabled={isUploading || !isImageLoaded}
            className="rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-900/10 min-w-[140px]"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Salvando...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Salvar Logo
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

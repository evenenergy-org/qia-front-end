import React, { useRef } from 'react'
import { Upload, Save, Export } from '@icon-park/react'
import { ImageObject } from '../../types/image'
import { DEFAULT_BOARD_CONFIG, DEFAULT_KNIFE_LINE_CONFIG, DEFAULT_BLEEDING_LINE_CONFIG, ImagePlacementType } from '../../config/constants'
import { saveElements } from '../../utils/storage'
import './Toolbar.css'
import Konva from 'konva'
import { operationHistory, OperationType } from '../../utils/operationHistory'
import { mmToPixels } from '../../utils/units'

interface ToolbarProps {
  onImagesSelected: (images: ImageObject[]) => void;
  boardWidth: number;
  boardHeight: number;
  boardPpi?: number;
  defaultPlacement?: ImagePlacementType;
  elements?: ImageObject[];
  stageRef: React.RefObject<any>;
  knifeLine?: {
    visible?: boolean;
    width?: number;
    export?: boolean;
    color?: string;
  };
  bleedingLine?: {
    visible?: boolean;
    width?: number;
    export?: boolean;
    color?: string;
  };
}

const Toolbar: React.FC<ToolbarProps> = ({
  onImagesSelected,
  boardWidth,
  boardHeight,
  boardPpi = DEFAULT_BOARD_CONFIG.ppi,
  defaultPlacement = 'center',
  elements = [],
  stageRef,
  knifeLine,
  bleedingLine
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 计算图片在画板中的位置和尺寸
  const calculateImagePlacement = (
    imageWidth: number,
    imageHeight: number,
    placementType: ImagePlacementType,
    offset: { x: number; y: number } = { x: 0, y: 0 }
  ) => {
    // 将画板尺寸转换为像素
    const boardPixelWidth = boardWidth * (boardPpi / 25.4) // mm to pixels
    const boardPixelHeight = boardHeight * (boardPpi / 25.4)

    if (placementType === 'fill') {
      // 计算填充模式下的缩放比例
      const scaleX = boardPixelWidth / imageWidth
      const scaleY = boardPixelHeight / imageHeight
      const scale = Math.max(scaleX, scaleY) // 取较大值以确保填满

      // 计算缩放后的尺寸
      const scaledWidth = imageWidth * scale
      const scaledHeight = imageHeight * scale

      // 计算从中心点开始的偏移量
      const x = (boardPixelWidth - scaledWidth) / 2
      const y = (boardPixelHeight - scaledHeight) / 2

      return {
        x: x + offset.x,
        y: y + offset.y,
        scaleX: scale,
        scaleY: scale,
        width: imageWidth,
        height: imageHeight
      }
    } else {
      // 居中模式
      // 计算适合画板的缩放比例，留出10%的边距
      const margin = 0.1
      const maxWidth = boardPixelWidth * (1 - margin * 2)
      const maxHeight = boardPixelHeight * (1 - margin * 2)

      const scaleX = maxWidth / imageWidth
      const scaleY = maxHeight / imageHeight
      const scale = Math.min(scaleX, scaleY) // 取较小值以确保完整显示

      const scaledWidth = imageWidth * scale
      const scaledHeight = imageHeight * scale

      // 计算居中位置，并添加偏移量
      const x = (boardPixelWidth - scaledWidth) / 2 + offset.x
      const y = (boardPixelHeight - scaledHeight) / 2 + offset.y

      return {
        x,
        y,
        scaleX: scale,
        scaleY: scale,
        width: imageWidth,
        height: imageHeight
      }
    }
  }

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const imageObjects: ImageObject[] = [];
    const baseOffset = 20; // 基础偏移量，用于错落叠放

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const image = new Image();

      // 创建图片对象的 Promise
      const imagePromise = new Promise<ImageObject>((resolve) => {
        image.onload = () => {
          const format = file.type.split('/')[1];
          // 计算错落叠放的偏移量
          const offset = {
            x: i * baseOffset,
            y: i * baseOffset
          };
          const placement = calculateImagePlacement(image.width, image.height, defaultPlacement, offset)

          resolve({
            id: `img_${Date.now()}_${i}`,
            name: file.name,
            format,
            width: placement.width,
            height: placement.height,
            rotation: 0,
            scaleX: placement.scaleX,
            scaleY: placement.scaleY,
            x: placement.x,
            y: placement.y,
            opacity: 1,
            visible: true,
            imageData: image
          });
        };
        image.src = URL.createObjectURL(file);
      });

      imageObjects.push(await imagePromise);
    }

    // 创建完整的新状态
    const newElements = [...elements, ...imageObjects];

    // 记录添加操作，使用完整的新状态
    operationHistory.addOperation(OperationType.ADD, {
      elements: newElements
    });

    // 通知父组件更新状态，使用完整的新状态
    onImagesSelected(newElements);

    // 清空 input 的值，确保可以重复选择同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSave = async () => {
    try {
      // 将 elements 转换为可存储的格式
      const elementsToStore = await Promise.all(elements.map(async element => {
        if (element.imageData) {
          // 创建一个临时的 canvas 来转换图片为 base64
          const canvas = document.createElement('canvas')
          canvas.width = element.imageData.width
          canvas.height = element.imageData.height
          const ctx = canvas.getContext('2d')
          if (ctx) {
            ctx.drawImage(element.imageData, 0, 0)
            const base64Data = canvas.toDataURL('image/png')
            return {
              ...element,
              imageData: base64Data
            }
          }
        }
        return element
      }))

      // 保存到 IndexedDB
      await saveElements(elementsToStore)
    } catch (error) {
      console.error('Failed to save elements:', error)
    }
  }

  const handleExport = () => {
    if (!stageRef.current) {
      console.error('Stage reference not found');
      return;
    }

    const stage = stageRef.current;
    const targetPpi = 300; // 目标 PPI
    const currentPpi = boardPpi;
    const scale = targetPpi / currentPpi;

    // 计算刀线宽度（像素）
    const baseKnifeLineWidth = knifeLine?.width ? mmToPixels(knifeLine.width, targetPpi) : 0;
    const shouldIncludeKnifeLine = knifeLine?.export; // 只根据export属性判断是否显示刀线
    const shouldKeepKnifeLineSpace = knifeLine?.width ? true : false; // 只要配置了刀线宽度就保留空间

    // 计算出血线宽度（像素）
    const baseBleedingLineWidth = bleedingLine?.width ? mmToPixels(bleedingLine.width, targetPpi) : 0;
    const shouldIncludeBleedingLine = bleedingLine?.export; // 只根据export属性判断是否显示出血线
    const shouldKeepBleedingLineSpace = bleedingLine?.width ? true : false; // 只要配置了出血线宽度就保留空间

    // 计算实际需要的尺寸（包含刀线和出血线空间）
    const totalExtraWidth = (shouldKeepKnifeLineSpace ? baseKnifeLineWidth * 2 : 0) + (shouldKeepBleedingLineSpace ? baseBleedingLineWidth * 2 : 0);
    const totalExtraHeight = (shouldKeepKnifeLineSpace ? baseKnifeLineWidth * 2 : 0) + (shouldKeepBleedingLineSpace ? baseBleedingLineWidth * 2 : 0);
    const width = mmToPixels(boardWidth, targetPpi) + totalExtraWidth; // mm to pixels
    const height = mmToPixels(boardHeight, targetPpi) + totalExtraHeight;

    // 创建一个临时 Stage 用于导出
    const tempStage = new Konva.Stage({
      container: document.createElement('div'),
      width: width,
      height: height
    });

    // 创建一个临时 Layer
    const tempLayer = new Konva.Layer();
    tempStage.add(tempLayer);

    // 只复制可见的图片元素到临时 Layer
    const visibleElements = elements.filter(element => element.visible);

    visibleElements.forEach(element => {
      if (element.imageData) {
        const image = new Konva.Image({
          x: (element.x * scale),
          y: (element.y * scale),
          image: element.imageData,
          width: element.width * element.scaleX * scale,
          height: element.height * element.scaleY * scale,
          rotation: element.rotation,
          opacity: element.opacity
        });
        tempLayer.add(image);
      }
    });

    // 如果需要导出出血线，添加出血线
    if (shouldIncludeBleedingLine) {
      const bleedingLineColor = bleedingLine?.color || DEFAULT_BLEEDING_LINE_CONFIG.color;
      const dash = [baseBleedingLineWidth, baseBleedingLineWidth];

      // 上出血线
      const topLine = new Konva.Line({
        points: [baseBleedingLineWidth / 2, baseBleedingLineWidth / 2, width - baseBleedingLineWidth / 2, baseBleedingLineWidth / 2],
        stroke: bleedingLineColor,
        strokeWidth: baseBleedingLineWidth,
        dash: dash,
        opacity: DEFAULT_BLEEDING_LINE_CONFIG.opacity
      });
      tempLayer.add(topLine);

      // 下出血线
      const bottomLine = new Konva.Line({
        points: [baseBleedingLineWidth / 2, height - baseBleedingLineWidth / 2, width - baseBleedingLineWidth / 2, height - baseBleedingLineWidth / 2],
        stroke: bleedingLineColor,
        strokeWidth: baseBleedingLineWidth,
        dash: dash,
        opacity: DEFAULT_BLEEDING_LINE_CONFIG.opacity
      });
      tempLayer.add(bottomLine);

      // 左出血线
      const leftLine = new Konva.Line({
        points: [baseBleedingLineWidth / 2, baseBleedingLineWidth / 2, baseBleedingLineWidth / 2, height - baseBleedingLineWidth / 2],
        stroke: bleedingLineColor,
        strokeWidth: baseBleedingLineWidth,
        dash: dash,
        opacity: DEFAULT_BLEEDING_LINE_CONFIG.opacity
      });
      tempLayer.add(leftLine);

      // 右出血线
      const rightLine = new Konva.Line({
        points: [width - baseBleedingLineWidth / 2, baseBleedingLineWidth / 2, width - baseBleedingLineWidth / 2, height - baseBleedingLineWidth / 2],
        stroke: bleedingLineColor,
        strokeWidth: baseBleedingLineWidth,
        dash: dash,
        opacity: DEFAULT_BLEEDING_LINE_CONFIG.opacity
      });
      tempLayer.add(rightLine);
    }

    // 如果需要导出刀线，添加刀线
    if (shouldIncludeKnifeLine) {
      const knifeLineColor = knifeLine?.color || DEFAULT_KNIFE_LINE_CONFIG.color;
      const dash = [baseKnifeLineWidth * 2, baseKnifeLineWidth * 2];

      // 上刀线
      const topLine = new Konva.Line({
        points: [
          baseBleedingLineWidth + baseKnifeLineWidth / 2, baseBleedingLineWidth + baseKnifeLineWidth / 2,
          width - baseBleedingLineWidth - baseKnifeLineWidth / 2, baseBleedingLineWidth + baseKnifeLineWidth / 2
        ],
        stroke: knifeLineColor,
        strokeWidth: baseKnifeLineWidth,
        dash: dash,
        opacity: DEFAULT_KNIFE_LINE_CONFIG.opacity
      });
      tempLayer.add(topLine);

      // 下刀线
      const bottomLine = new Konva.Line({
        points: [
          baseBleedingLineWidth + baseKnifeLineWidth / 2, height - baseBleedingLineWidth - baseKnifeLineWidth / 2,
          width - baseBleedingLineWidth - baseKnifeLineWidth / 2, height - baseBleedingLineWidth - baseKnifeLineWidth / 2
        ],
        stroke: knifeLineColor,
        strokeWidth: baseKnifeLineWidth,
        dash: dash,
        opacity: DEFAULT_KNIFE_LINE_CONFIG.opacity
      });
      tempLayer.add(bottomLine);

      // 左刀线
      const leftLine = new Konva.Line({
        points: [
          baseBleedingLineWidth + baseKnifeLineWidth / 2, baseBleedingLineWidth + baseKnifeLineWidth / 2,
          baseBleedingLineWidth + baseKnifeLineWidth / 2, height - baseBleedingLineWidth - baseKnifeLineWidth / 2
        ],
        stroke: knifeLineColor,
        strokeWidth: baseKnifeLineWidth,
        dash: dash,
        opacity: DEFAULT_KNIFE_LINE_CONFIG.opacity
      });
      tempLayer.add(leftLine);

      // 右刀线
      const rightLine = new Konva.Line({
        points: [
          width - baseBleedingLineWidth - baseKnifeLineWidth / 2, baseBleedingLineWidth + baseKnifeLineWidth / 2,
          width - baseBleedingLineWidth - baseKnifeLineWidth / 2, height - baseBleedingLineWidth - baseKnifeLineWidth / 2
        ],
        stroke: knifeLineColor,
        strokeWidth: baseKnifeLineWidth,
        dash: dash,
        opacity: DEFAULT_KNIFE_LINE_CONFIG.opacity
      });
      tempLayer.add(rightLine);
    }

    // 导出图片
    const dataURL = tempStage.toDataURL({
      pixelRatio: 1,
      mimeType: 'image/png'
    });

    // 创建下载链接
    const link = document.createElement('a');
    link.download = 'export.png';
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 清理临时 Stage
    tempStage.destroy();
  };

  return (
    <div className="toolbar">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageSelect}
        accept="image/*"
        multiple
        style={{ display: 'none' }}
      />
      <button
        className="toolbar-button"
        onClick={handleUploadClick}
        title="上传图片"
      >
        <Upload theme="outline" size="24" fill="#333" />
      </button>
      <button
        className="toolbar-button"
        onClick={handleSave}
        title="保存"
      >
        <Save theme="outline" size="24" fill="#333" />
      </button>
      <button
        className="toolbar-button"
        onClick={handleExport}
        title="导出高质量图片"
      >
        <Export theme="outline" size="24" fill="#333" />
      </button>
    </div>
  )
}

export { Toolbar } 
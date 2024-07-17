import React, { useRef, useEffect, useState, useImperativeHandle } from 'react';
import { createUseStyles } from 'react-jss';
import { v4 as uuid } from 'uuid';
import BBoxSelector from './BBoxSelector';
import LabelBox from './LabelBox';

const useStyles = createUseStyles({
  bBoxAnnotator: {
    cursor: 'crosshair',
    position: 'relative',
  },
  imageFrame: {
    position: 'relative',
    backgroundSize: '100%',
  },
});

const BBoxAnnotator = ({ url, initialAnnotations, onChange }) => {
  const classes = useStyles();
  const [entries, setEntries] = useState(initialAnnotations || []);
  const [status, setStatus] = useState('free');
  const [offset, setOffset] = useState(null);
  const [pointer, setPointer] = useState(null);
  const bBoxAnnotatorRef = useRef(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageSize({ width: img.width, height: img.height });
    };
    img.src = url;
  }, [url]);

  useEffect(() => {
    onChange(entries);
  }, [entries, onChange]);

  const crop = (pageX, pageY) => {
    const rect = bBoxAnnotatorRef.current.getBoundingClientRect();
    return {
      x: Math.min(Math.max(pageX - rect.left, 0), rect.width),
      y: Math.min(Math.max(pageY - rect.top, 0), rect.height),
    };
  };

  const mouseDownHandler = (e) => {
    if (e.button !== 2) {
      const croppedPos = crop(e.pageX, e.pageY);
      setOffset(croppedPos);
      setPointer(croppedPos);
      setStatus('hold');
    }
  };

  const mouseMoveHandler = (e) => {
    if (status === 'hold') {
      setPointer(crop(e.pageX, e.pageY));
    }
  };

  const mouseUpHandler = (e) => {
    if (status === 'hold') {
      const croppedPos = crop(e.pageX, e.pageY);
      setPointer(croppedPos);
      setStatus('input');
    }
  };

  const addEntry = (label) => {
    const rect = calculateRect();
    setEntries([...entries, { ...rect, label, id: uuid() }]);
    setStatus('free');
    setOffset(null);
    setPointer(null);
  };

  const removeEntry = (id) => {
    setEntries(entries.filter(entry => entry.id !== id));
  };

  const calculateRect = () => {
    if (!offset || !pointer) return null;
    const x1 = Math.min(offset.x, pointer.x);
    const y1 = Math.min(offset.y, pointer.y);
    const x2 = Math.max(offset.x, pointer.x);
    const y2 = Math.max(offset.y, pointer.y);
    return {
      left: x1,
      top: y1,
      width: x2 - x1,
      height: y2 - y1,
    };
  };

  return (
    <div
      ref={bBoxAnnotatorRef}
      className={classes.bBoxAnnotator}
      style={{ width: imageSize.width, height: imageSize.height }}
      onMouseDown={mouseDownHandler}
      onMouseMove={mouseMoveHandler}
      onMouseUp={mouseUpHandler}
    >
      <div
        className={classes.imageFrame}
        style={{ 
          width: imageSize.width, 
          height: imageSize.height, 
          backgroundImage: `url(${url})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {(status === 'hold' || status === 'input') && <BBoxSelector rectangle={calculateRect()} />}
        {status === 'input' && (
          <LabelBox
            top={pointer.y}
            left={pointer.x}
            onSubmit={addEntry}
          />
        )}
        {entries.map((entry) => (
          <div
            key={entry.id}
            style={{
              border: '2px solid rgb(255,0,0)',
              position: 'absolute',
              top: `${entry.top}px`,
              left: `${entry.left}px`,
              width: `${entry.width}px`,
              height: `${entry.height}px`,
              color: 'rgb(255,0,0)',
              fontFamily: 'monospace',
              fontSize: 'small',
            }}
          >
            <div style={{ overflow: 'hidden' }}>{entry.label}</div>
            <button
              onClick={() => removeEntry(entry.id)}
              style={{
                position: 'absolute',
                top: '-10px',
                right: '-10px',
                background: 'red',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                cursor: 'pointer',
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BBoxAnnotator;
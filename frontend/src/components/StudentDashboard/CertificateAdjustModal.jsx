import React, { useState } from 'react';
import { Stage, Layer, Image as KonvaImage, Text } from 'react-konva';
import useImage from 'use-image';

export default function CertificateAdjustModal({
  open,
  onClose,
  onConfirm,
  name,
  track,
  date,
  initial,
}) {
  const [bgImage] = useImage('/Certificate_Templates/Certificate_Of_Completion.png');
  // Default positions/sizes (can be adjusted)
  const [nameProps, setNameProps] = useState(initial?.nameProps || { x: 200, y: 220, fontSize: 48 });
  const [trackProps, setTrackProps] = useState(initial?.trackProps || { x: 200, y: 290, fontSize: 28 });
  const [dateProps, setDateProps] = useState(initial?.dateProps || { x: 600, y: 340, fontSize: 22 });

  if (!open) return null;

  return (
    <div className="certificate-adjust-modal-overlay">
      <div className="certificate-adjust-modal-content">
        <h2 className="certificate-adjust-modal-heading">
          Adjust your own completion certificate <span role="img" aria-label="wink">😉</span>
        </h2>
        <Stage width={1080} height={768} style={{ background: '#111', borderRadius: 8, maxWidth: '100%', height: 'auto' }}>
          <Layer>
            {bgImage && <KonvaImage image={bgImage} width={1080} height={768} />}
            <Text
              text={name}
              x={nameProps.x}
              y={nameProps.y}
              fontSize={nameProps.fontSize}
              fontFamily="Pinyon Script"
              fill="#ead18a"
              draggable
              onDragEnd={e => setNameProps({ ...nameProps, x: e.target.x(), y: e.target.y() })}
            />
            <Text
              text={`"${track}"`}
              x={trackProps.x}
              y={trackProps.y}
              fontSize={trackProps.fontSize}
              fontFamily="Montserrat"
              fill="#ead18a"
              draggable
              onDragEnd={e => setTrackProps({ ...trackProps, x: e.target.x(), y: e.target.y() })}
            />
            <Text
              text={date}
              x={dateProps.x}
              y={dateProps.y}
              fontSize={dateProps.fontSize}
              fontFamily="Montserrat"
              fill="#ead18a"
              draggable
              onDragEnd={e => setDateProps({ ...dateProps, x: e.target.x(), y: e.target.y() })}
            />
          </Layer>
        </Stage>
        <div className="certificate-adjust-modal-controls">
          <div>
            <label>Name Size<br/>
              <input type="range" min={24} max={100} value={nameProps.fontSize} onChange={e => setNameProps({ ...nameProps, fontSize: parseInt(e.target.value) })} />
              <span style={{ marginLeft: 8 }}>{nameProps.fontSize}px</span>
            </label>
          </div>
          <div>
            <label>Track Size<br/>
              <input type="range" min={16} max={60} value={trackProps.fontSize} onChange={e => setTrackProps({ ...trackProps, fontSize: parseInt(e.target.value) })} />
              <span style={{ marginLeft: 8 }}>{trackProps.fontSize}px</span>
            </label>
          </div>
          <div>
            <label>Date Size<br/>
              <input type="range" min={12} max={40} value={dateProps.fontSize} onChange={e => setDateProps({ ...dateProps, fontSize: parseInt(e.target.value) })} />
              <span style={{ marginLeft: 8 }}>{dateProps.fontSize}px</span>
            </label>
          </div>
        </div>
        <div className="certificate-adjust-modal-actions">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button className="download-btn" onClick={() => onConfirm({ nameProps, trackProps, dateProps })}>Save &amp; Download</button>
        </div>
        <p style={{ color: '#ead18a', fontSize: 14, marginTop: 10, textAlign: 'center', fontFamily: 'Montserrat' }}>
          Drag your name, track, and date to adjust their positions and sizes. Text is not editable.
        </p>
      </div>
    </div>
  );
} 
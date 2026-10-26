'use client';
import { useState } from 'react';

const BUILDING_IMAGES = {
  carport: '/carport_.png',
  barn: '/Barn_.png',
  commercial: '/commercial_.png',
  garage: '/Garage_.png',
};

export default function BuildingConfigurator() {
  const [config, setConfig] = useState({
    type: 'carport',
    width: 12,
    length: 20,
    height: 8,
    roofStyle: 'gable',
    material: 'steel',
    color: 'white',
  });

  const buildingTypes = [
    { value: 'carport', label: 'Carport', icon: '🚗' },
    { value: 'barn', label: 'Barn', icon: '🏚️' },
    { value: 'commercial', label: 'Commercial', icon: '🏭' },
    { value: 'garage', label: 'Garage', icon: '🏠' },
  ];

  const handleConfigChange = (key, value) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const calculatePrice = () => {
    const basePrice = config.width * config.length * 15;
    const typeMultiplier = {
      carport: 1,
      barn: 1.2,
      commercial: 1.5,
      garage: 1.3,
    };
    return Math.round(basePrice * (typeMultiplier[config.type] ?? 1));
  };

  const widthPct = ((config.width - 8) / (40 - 8)) * 100;
  const lengthPct = ((config.length - 12) / (60 - 12)) * 100;
  const heightPct = ((config.height - 7) / (16 - 7)) * 100;

  return (
    <section className="configurator" id="configurator">
      {/*
        Rotation keyframes are declared globally once.
        Using CSS animation on the <img> so it truly rotates (Y-axis spin).
        key={config.type} forces React to remount the <img> on type change,
        which restarts the animation from 0°, giving a clean switch.
      */}
      <style>{`
        @keyframes previewRotateY {
          from { transform: perspective(800px) rotateY(0deg)   rotateX(6deg); }
          to   { transform: perspective(800px) rotateY(360deg) rotateX(6deg); }
        }
        .preview-building-img {
          max-width: 82%;
          max-height: 185px;
          width: auto;
          height: auto;
          object-fit: contain;
          display: block;
          margin: auto;
          filter: drop-shadow(0 6px 22px rgba(0,212,255,0.42))
                  drop-shadow(0 0 6px  rgba(0,212,255,0.2));
          animation: previewRotateY 10s linear infinite;
          transition: filter 0.35s ease;
          cursor: pointer;
        }
        .preview-building-img:hover {
          filter: drop-shadow(0 6px 36px rgba(0,212,255,0.7))
                  drop-shadow(0 0 12px rgba(0,212,255,0.45));
          animation-play-state: paused;
        }
        .preview-building-wrap {
          width: 100%;
          height: 100%;
          min-height: 180px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>

      <div className="configurator__container">
        <div className="configurator__header">
          <span className="configurator__label">Real-Time Estimator</span>
          <h2 className="configurator__title">Configure Your Building</h2>
          <p className="configurator__subtitle">
            Customize every aspect and see the price update in real-time
          </p>
        </div>

        <div className="configurator__content">
          {/* ── FORM PANEL ── */}
          <div className="configurator__form">
            <div className="form-group">
              <label className="form-label">Building Type</label>
              <div className="building-types">
                {buildingTypes.map((type) => (
                  <button
                    key={type.value}
                    className={`building-type ${config.type === type.value ? 'building-type--active' : ''
                      }`}
                    onClick={() => handleConfigChange('type', type.value)}
                  >
                    <span className="building-type__icon">{type.icon}</span>
                    <span className="building-type__label">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Width&nbsp;
                  <span className="form-value">{config.width} ft</span>
                </label>
                <input
                  type="range"
                  min="8"
                  max="40"
                  value={config.width}
                  onChange={(e) =>
                    handleConfigChange('width', parseInt(e.target.value))
                  }
                  className="form-range"
                  style={{ '--progress': `${widthPct}%` }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Length&nbsp;
                  <span className="form-value">{config.length} ft</span>
                </label>
                <input
                  type="range"
                  min="12"
                  max="60"
                  value={config.length}
                  onChange={(e) =>
                    handleConfigChange('length', parseInt(e.target.value))
                  }
                  className="form-range"
                  style={{ '--progress': `${lengthPct}%` }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Height&nbsp;
                <span className="form-value">{config.height} ft</span>
              </label>
              <input
                type="range"
                min="7"
                max="16"
                value={config.height}
                onChange={(e) =>
                  handleConfigChange('height', parseInt(e.target.value))
                }
                className="form-range"
                style={{ '--progress': `${heightPct}%` }}
              />
            </div>

            <div className="price-display">
              <div className="price-display__amount">
                ${calculatePrice().toLocaleString()}
              </div>
            </div>

            <button className="configurator__btn">
              <span className="btn-icon">📋</span>
              Get Detailed Quote
            </button>
          </div>

          {/* ── PREVIEW PANEL ── */}
          <div className="configurator__preview">
            <div className="preview-3d">
              <div className="preview-3d__label">Live Preview</div>

              <div className="preview-3d__building">
                <div className="preview-building-wrap">
                  {/*
                    key={config.type} → remounts on every type change,
                    restarting the CSS rotation from angle 0.
                  */}
                  <img
                    key={config.type}
                    src={BUILDING_IMAGES[config.type]}
                    alt={`${config.type} building preview`}
                    className="preview-building-img"
                    title="Hover to pause rotation"
                  />
                </div>
              </div>

              <div className="preview-3d__specs">
                <div className="spec">
                  <span className="spec__label">Dimensions</span>
                  <span className="spec__value">
                    {config.width}′ × {config.length}′ × {config.height}′
                  </span>
                </div>
                <div className="spec">
                  <span className="spec__label">Type</span>
                  <span className="spec__value">
                    {buildingTypes.find((t) => t.value === config.type)?.label}
                  </span>
                </div>
                <div className="spec">
                  <span className="spec__label">Floor Area</span>
                  <span className="spec__value">
                    {(config.width * config.length).toLocaleString()} sq ft
                  </span>
                </div>
                <div className="spec">
                  <span className="spec__label">Price / sq ft</span>
                  <span className="spec__value">
                    ${(calculatePrice() / (config.width * config.length)).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
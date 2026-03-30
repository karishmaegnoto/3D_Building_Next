'use client';
import { useState } from 'react';

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
    { value: 'warehouse', label: 'Warehouse', icon: '🏭' },
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
      warehouse: 1.5,
      garage: 1.3,
    };
    return Math.round(basePrice * typeMultiplier[config.type]);
  };

  const widthPct = ((config.width - 8) / (40 - 8)) * 100;
  const lengthPct = ((config.length - 12) / (60 - 12)) * 100;
  const heightPct = ((config.height - 7) / (16 - 7)) * 100;

  const previewScale = Math.min(
    config.width / 30,
    config.length / 40,
    1.4
  );

  return (
    <section className="configurator" id="configurator">
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
                    className={`building-type ${
                      config.type === type.value ? 'building-type--active' : ''
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
                <div
                  className="preview-3d__structure"
                  style={{
                    transform: `rotateY(0deg) rotateX(10deg) scale(${previewScale})`,
                    width: `${80 + config.width * 2}px`,
                    height: `${40 + config.height * 4}px`,
                  }}
                >
                  <div className="preview-3d__roof"></div>
                  <div className="preview-3d__walls"></div>
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
                    $
                    {(
                      calculatePrice() /
                      (config.width * config.length)
                    ).toFixed(2)}
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

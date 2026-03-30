// 'use client';

// export default function Features() {
//   const features = [
//     {
//       icon: '🏗️',
//       title: '3D Visualization',
//       description: 'See your building in realistic 3D before you build it',
//       num: '01',
//     },
//     {
//       icon: '💰',
//       title: 'Instant Pricing',
//       description: 'Get accurate cost estimates in real-time as you design',
//       num: '02',
//     },
//     {
//       icon: '📐',
//       title: 'Custom Dimensions',
//       description: 'Adjust size, height, and specifications to your needs',
//       num: '03',
//     },
//     {
//       icon: '🎨',
//       title: 'Material Options',
//       description: 'Choose from various colors, materials, and finishes',
//       num: '04',
//     },
//     {
//       icon: '📱',
//       title: 'Mobile Friendly',
//       description: 'Design on any device with our responsive interface',
//       num: '05',
//     },
//     {
//       icon: '⚡',
//       title: 'Quick Quotes',
//       description: 'Generate professional quotes instantly',
//       num: '06',
//     },
//   ];

//   return (
//     <section className="features" id="features">
//       <div className="features__container">
//         <div className="features__header">
//           <span className="features__label">Platform Capabilities</span>
//           <h2 className="features__title">
//             Why Choose Our <span>Platform?</span>
//           </h2>
//           <p className="features__subtitle">
//             Experience the future of building design with our advanced features
//           </p>
//         </div>

//         <div className="features__grid">
//           {features.map((feature) => (
//             <div
//               key={feature.num}
//               className="feature-card"
//               data-num={feature.num}
//             >
//               <div className="feature-card__icon">{feature.icon}</div>
//               <h3 className="feature-card__title">{feature.title}</h3>
//               <p className="feature-card__description">{feature.description}</p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }

'use client';

export default function Features() {
  const features = [
    {
      icon: '🏗️',
      title: '3D Visualization',
      description: 'See your building in realistic 3D before you build it',
      num: '01',
    },
    {
      icon: '💰',
      title: 'Instant Pricing',
      description: 'Get accurate cost estimates in real-time as you design',
      num: '02',
    },
    {
      icon: '📐',
      title: 'Custom Dimensions',
      description: 'Adjust size, height, and specifications to your needs',
      num: '03',
    },
    {
      icon: '🎨',
      title: 'Material Options',
      description: 'Choose from various colors, materials, and finishes',
      num: '04',
    },
    {
      icon: '📱',
      title: 'Mobile Friendly',
      description: 'Design on any device with our responsive interface',
      num: '05',
    },
    {
      icon: '⚡',
      title: 'Quick Quotes',
      description: 'Generate professional quotes instantly',
      num: '06',
    },
  ];

  return (
    <section className="features" id="features">
      <div className="features__container">
        <div className="features__header">
          <span className="features__label">Platform Capabilities</span>
          <h2 className="features__title">
            Why Choose Our <span>Platform?</span>
          </h2>
          <p className="features__subtitle">
            Experience the future of building design with our advanced features
          </p>
        </div>

        <div className="features__grid">
          {features.map((feature) => (
            <div
              key={feature.num}
              className="feature-card"
              data-num={feature.num}
            >
              <div className="feature-card__icon">{feature.icon}</div>
              <h3 className="feature-card__title">{feature.title}</h3>
              <p className="feature-card__description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
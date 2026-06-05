import React, { useEffect, useState, useRef } from 'react';
import { MapPin, Compass, Navigation } from 'lucide-react';

interface MapPlaceholderProps {
  pickup?: string;
  dropoff?: string;
  status?: 'pending' | 'accepted' | 'arrived' | 'ongoing' | 'completed' | 'cancelled';
  interactive?: boolean;
  onSelectNode?: (name: string) => void;
}

// Coordinate scales for Pithoragarh on 400x300 canvas
const LOCATION_NODES_MAP: Record<string, { x: number; y: number; desc: string }> = {
  'Siltham Tiraha': { x: 180, y: 160, desc: 'Town Junction' },
  'Pithoragarh Bus Station': { x: 220, y: 150, desc: 'Central Transit' },
  'Chandak Hill Temple': { x: 110, y: 90, desc: 'Hill Viewpoint' },
  'GIC Road Chowk': { x: 240, y: 180, desc: 'School Lane' },
  'Wadda Crossing': { x: 300, y: 220, desc: 'East Valley Entrance' },
  'Dharachula Road Gate': { x: 230, y: 80, desc: 'North Highway Crossing' },
  'Jhulaghat Border Bridge': { x: 370, y: 120, desc: 'India-Nepal Crossing' },
  'Lohaghat Market': { x: 70, y: 250, desc: 'Southern Highway Route' },
  'Munsyari Tourism Hub': { x: 70, y: 40, desc: 'Snow Peak Tourism' },
  'Dharchula Valley': { x: 310, y: 50, desc: 'Kailash Gate' },
  'Didihat Town': { x: 160, y: 95, desc: 'Beautiful Ridge Town' },
  'Berinag Tea Estates': { x: 50, y: 130, desc: 'Tea Gardens View' },
  'Gangolihat Mahakali Temple': { x: 40, y: 190, desc: 'Holy Temple Site' },
  'Askot Sanctuary': { x: 290, y: 110, desc: 'Wildlife Reserve' },
  'Jauljibi Confluence': { x: 340, y: 85, desc: 'River Confluence' },
  'Thal Market': { x: 110, y: 140, desc: 'Scenic Foothills Market' },
  'Kanalichhina Range': { x: 250, y: 135, desc: 'Mountain Range' },
  'Madkot Hot Springs': { x: 130, y: 40, desc: 'Healing Sulphur Springs' },
  'Gunji Village': { x: 380, y: 30, desc: 'High Indo-Tibetan Post' },
  'Tejam Valley': { x: 200, y: 45, desc: 'Gorge Road' },
  'Tawaghat Junction': { x: 360, y: 65, desc: 'Hydroelectric River Site' }
};

export const MapPlaceholder: React.FC<MapPlaceholderProps> = ({
  pickup,
  dropoff,
  status,
  interactive,
  onSelectNode
}) => {
  const [carProgress, setCarProgress] = useState<number>(0);
  const animationRef = useRef<number | null>(null);

  const startNode = pickup ? LOCATION_NODES_MAP[pickup] : null;
  const endNode = dropoff ? LOCATION_NODES_MAP[dropoff] : null;

  // Animate car along path if ride is ongoing
  useEffect(() => {
    if (status === 'ongoing') {
      setCarProgress(0);
      const startTime = Date.now();
      const duration = 12000; // 12 seconds loop for mock travel

      const updateCar = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        setCarProgress(progress);

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(updateCar);
        } else {
          // Restart loop
          setCarProgress(0);
          animationRef.current = requestAnimationFrame(updateCar);
        }
      };

      animationRef.current = requestAnimationFrame(updateCar);
    } else {
      setCarProgress(0);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [status, pickup, dropoff]);

  // Compute exact car position representing the travel coordinates
  let carX = 180;
  let carY = 165;
  if (startNode && endNode && status === 'ongoing') {
    carX = startNode.x + (endNode.x - startNode.x) * carProgress;
    carY = startNode.y + (endNode.y - startNode.y) * carProgress;
  } else if (startNode) {
    carX = startNode.x;
    carY = startNode.y;
  }

  return (
    <div className="relative h-72 w-full overflow-hidden rounded-xl border border-gray-100 bg-emerald-50/20 md:h-96">
      {/* Decorative Compass Rose */}
      <div className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white/95 shadow-xs">
        <Compass className="h-5 w-5 animate-pulse text-emerald-600" />
      </div>

      {/* Pithoragarh Elevation Contour Lines Map Simulation SVG */}
      <svg viewBox="0 0 400 300" className="h-full w-full select-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="mountains" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ecfdf5" />
            <stop offset="100%" stopColor="#f0fdf4" />
          </linearGradient>
          <radialGradient id="mountainPeak" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f8fafc" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#f1f5f9" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Contour Fills */}
        <rect width="400" height="300" fill="url(#mountains)" />
        <circle cx="200" cy="150" r="180" fill="url(#mountainPeak)" />
        <circle cx="100" cy="80" r="120" fill="url(#mountainPeak)" />
        <circle cx="350" cy="220" r="100" fill="url(#mountainPeak)" />

        {/* Decorative Grid Lines */}
        <g stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="3,3" opacity="0.6">
          <line x1="50" y1="0" x2="50" y2="300" />
          <line x1="100" y1="0" x2="100" y2="300" />
          <line x1="150" y1="0" x2="150" y2="300" />
          <line x1="200" y1="0" x2="200" y2="300" />
          <line x1="250" y1="0" x2="250" y2="300" />
          <line x1="300" y1="0" x2="300" y2="300" />
          <line x1="350" y1="0" x2="350" y2="300" />
          <line x1="0" y1="50" x2="400" y2="50" />
          <line x1="0" y1="100" x2="400" y2="100" />
          <line x1="0" y1="150" x2="400" y2="150" />
          <line x1="0" y1="200" x2="400" y2="200" />
          <line x1="0" y1="250" x2="400" y2="250" />
        </g>

        {/* Simulated Mountain Contours (Hills of Pithoragarh) */}
        <path d="M 0,120 Q 80,90 150,130 T 300,80 T 400,100" fill="none" stroke="#d1fae5" strokeWidth="1.5" />
        <path d="M 0,220 Q 100,180 200,240 T 350,190 T 400,225" fill="none" stroke="#d1fae5" strokeWidth="1.5" />
        <path d="M 50,300 Q 150,220 220,280 T 380,240" fill="none" stroke="#d1fae5" strokeWidth="1" />

        {/* Main Mountain Highway Route Layout Connection lines */}
        <path 
          d="M 70,250 L 180,160 L 220,150 L 240,180 L 300,220" 
          fill="none" 
          stroke="#cbd5e1" 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        <path 
          d="M 110,90 L 180,160 L 220,150 L 230,80 L 370,120" 
          fill="none" 
          stroke="#cbd5e1" 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />

        {/* Active route highlighting matching pickup to dropoff */}
        {startNode && endNode && (
          <path
            d={`M ${startNode.x},${startNode.y} L ${endNode.x},${endNode.y}`}
            fill="none"
            stroke={status === 'ongoing' ? '#10b981' : '#64748b'}
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeDasharray={status === 'pending' ? '4,4' : undefined}
            className={status === 'pending' ? 'animate-pulse' : undefined}
          />
        )}

        {/* Render interactive or visual location nodes */}
        {Object.entries(LOCATION_NODES_MAP).map(([name, node]) => {
          const isSelected = pickup === name || dropoff === name;
          return (
            <g
              key={name}
              className={interactive ? 'cursor-pointer hover:opacity-90' : undefined}
              onClick={() => onSelectNode && onSelectNode(name)}
            >
              {/* Highlight Ring */}
              {isSelected && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="12"
                  className="animate-ping"
                  fill={pickup === name ? '#10b981' : '#ef4444'}
                  opacity="0.3"
                />
              )}
              {/* Core Node Marker */}
              <circle
                cx={node.x}
                cy={node.y}
                r={isSelected ? '6' : '4'}
                fill={pickup === name ? '#10b981' : dropoff === name ? '#ef4444' : '#94a3b8'}
                stroke="#ffffff"
                strokeWidth="1.5"
                className="transition-all duration-300"
              />
              {/* Label text */}
              <text
                x={node.x}
                y={node.y - 8}
                textAnchor="middle"
                fontSize="6"
                fontWeight={isSelected ? 'bold' : 'normal'}
                fill={isSelected ? '#1e293b' : '#64748b'}
                fontFamily="sans-serif"
                className="pointer-events-none select-none bg-white"
              >
                {name}
              </text>
            </g>
          );
        })}

        {/* Moving Car Representation on Ongoing state */}
        {startNode && endNode && status === 'ongoing' && (
          <g>
            <circle cx={carX} cy={carY} r="9" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" className="shadow-lg" />
            <path
              d="M -3,-3 L 3,0 L -3,3 Z"
              fill="#ffffff"
              transform={`translate(${carX}, ${carY}) rotate(${
                Math.atan2(endNode.y - startNode.y, endNode.x - startNode.x) * (180 / Math.PI)
              })`}
            />
          </g>
        )}
      </svg>

      {/* Floating Panel Legend */}
      <div className="absolute bottom-4 left-4 rounded-lg border border-gray-100 bg-white/95 px-3 py-1.5 shadow-sm text-[10px]">
        <div className="flex flex-col space-y-1">
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span className="font-medium text-gray-700">Pickup Destination</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-red-500"></span>
            <span className="font-medium text-gray-700">Dropoff Destination</span>
          </div>
          {status && (
            <div className="flex items-center space-x-2 border-t border-gray-100 pt-1 mt-0.5">
              <Navigation className="h-2.5 w-2.5 text-emerald-600 animate-spin" />
              <span className="font-semibold text-emerald-800 uppercase text-[9px] tracking-wider">
                Status: {status}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

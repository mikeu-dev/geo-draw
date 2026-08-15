'use client';

import { useEffect, useRef } from 'react';
import type { Map } from 'ol';
import { useToast } from '@/hooks/use-toast';

interface CesiumControllerProps {
  map: Map | null;
  enabled: boolean;
}

interface WindowWithCesium extends Window {
  Cesium?: {
    Ion?: {
      defaultAccessToken: string;
    };
    createWorldTerrainAsync?: () => Promise<unknown>;
    Cesium3DTileset?: {
      fromUrl: (url: string, options: unknown) => Promise<unknown>;
    };
  };
  olcs?: {
    OLCesium: new (options: { map: Map | null }) => {
      getCesiumScene: () => {
        terrainProvider: unknown;
        primitives: { add: (tileset: unknown) => void };
      };
      setEnabled: (enabled: boolean) => void;
    };
  };
}

export default function CesiumController({ map, enabled }: CesiumControllerProps) {
  const ol3d = useRef<{ setEnabled: (enabled: boolean) => void } | null>(null);
  const isInitialized = useRef(false);
  const isInitializing = useRef(false);
  const { toast } = useToast();

  useEffect(() => {
    // Only initialize when user explicitly enables 3D Globe
    if (!enabled || !map || typeof window === 'undefined') return;

    if (isInitialized.current && ol3d.current) {
      ol3d.current.setEnabled(true);
      return;
    }

    if (isInitializing.current) return;
    isInitializing.current = true;

    const initCesium = async (): Promise<boolean> => {
      const win = window as unknown as WindowWithCesium;
      const Cesium = win.Cesium;
      const OLCesium = win.olcs?.OLCesium;

      if (!Cesium || !OLCesium) {
        return false;
      }

      try {
        const ol3dInstance = new OLCesium({ map });
        ol3d.current = ol3dInstance;

        // Optional: only load Cesium Ion terrain if a valid access token is provided
        const ionToken =
          process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN ||
          win.Cesium?.Ion?.defaultAccessToken;

        if (ionToken && Cesium.createWorldTerrainAsync) {
          try {
            const scene = ol3dInstance.getCesiumScene();
            const terrainProvider = await Cesium.createWorldTerrainAsync();
            scene.terrainProvider = terrainProvider;
          } catch {
            // Silently fallback to default WGS84 ellipsoid globe
          }
        }

        isInitialized.current = true;
        ol3dInstance.setEnabled(true);
        return true;
      } catch (error) {
        console.error('Error initializing OLCesium:', error);
        return false;
      } finally {
        isInitializing.current = false;
      }
    };

    let attempts = 0;
    const maxAttempts = 8;
    const interval = setInterval(async () => {
      attempts++;
      const success = await initCesium();
      if (success || attempts >= maxAttempts) {
        clearInterval(interval);
        if (!success) {
          toast({
            title: '3D Globe Belum Tersedia',
            description: 'Sedang memuat library visualisasi 3D dari CDN...',
            duration: 4000,
          });
        }
      }
    }, 400);

    return () => clearInterval(interval);
  }, [map, enabled, toast]);

  useEffect(() => {
    if (isInitialized.current && ol3d.current) {
      try {
        ol3d.current.setEnabled(enabled);
      } catch (error) {
        console.error('Error toggling Cesium state:', error);
      }
    }
  }, [enabled]);

  return null;
}



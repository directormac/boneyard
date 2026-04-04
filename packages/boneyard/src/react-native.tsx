import {
  useRef,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import {
  View,
  Animated,
  Easing,
  useWindowDimensions,
  useColorScheme,
  StyleSheet,
  type ViewStyle,
  type LayoutChangeEvent,
} from 'react-native'
import type { Bone, SkeletonResult, ResponsiveBones } from './types.js'

// ── Bones registry ──────────────────────────────────────────────────────────
const bonesRegistry = new Map<string, SkeletonResult | ResponsiveBones>()

/**
 * Register pre-generated bones so `<Skeleton name="...">` can auto-resolve them.
 *
 * Called by the generated `registry.js` file (created by `npx boneyard-js build`).
 * Import it once in your app entry point:
 *
 * ```ts
 * import './bones/registry'
 * ```
 */
export function registerBones(map: Record<string, SkeletonResult | ResponsiveBones>): void {
  for (const [name, bones] of Object.entries(map)) {
    bonesRegistry.set(name, bones)
  }
}

/** Pick the right SkeletonResult from a responsive set for the current width */
function resolveResponsive(
  bones: SkeletonResult | ResponsiveBones,
  width: number,
): SkeletonResult | null {
  if (!('breakpoints' in bones)) return bones
  const bps = Object.keys(bones.breakpoints).map(Number).sort((a, b) => a - b)
  if (bps.length === 0) return null
  const match = [...bps].reverse().find(bp => width >= bp) ?? bps[0]
  return bones.breakpoints[match] ?? null
}

/** Hook: pulse animation value 0→1→0 looping at 1.8s total */
function usePulseAnimation(enabled: boolean): Animated.Value {
  const anim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (!enabled) {
      anim.setValue(0)
      return
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [enabled, anim])

  return anim
}

export interface SkeletonProps {
  /** When true, shows the skeleton. When false, shows children. */
  loading: boolean
  /** Your component — rendered when not loading. */
  children: ReactNode
  /**
   * Name this skeleton. Used to auto-resolve pre-generated bones from the registry.
   */
  name?: string
  /**
   * Pre-generated bones. Accepts a single `SkeletonResult` or a `ResponsiveBones` map.
   */
  initialBones?: SkeletonResult | ResponsiveBones
  /** Bone color (default: '#d4d4d4') */
  color?: string
  /** Bone color for dark mode (default: '#3a3a3c') */
  darkColor?: string
  /**
   * Force dark mode on/off. When omitted, uses the system color scheme.
   * Set to `false` explicitly if your app has a light background regardless
   * of the system theme.
   */
  dark?: boolean
  /** Enable pulse animation (default: true) */
  animate?: boolean
  /** Additional style for the container */
  style?: ViewStyle
  /**
   * Shown when loading is true and no bones are available.
   */
  fallback?: ReactNode
}

/**
 * React Native skeleton loading component.
 *
 * Renders pixel-perfect skeleton loading screens using pre-generated bone
 * positions from `npx boneyard-js build`.
 *
 * @example
 * ```tsx
 * import { Skeleton } from 'boneyard-js/native'
 * import dashboardBones from './bones/dashboard.bones.json'
 *
 * <Skeleton name="dashboard" loading={isLoading} initialBones={dashboardBones}>
 *   <DashboardUI />
 * </Skeleton>
 * ```
 */
export function Skeleton({
  loading,
  children,
  name,
  initialBones,
  color,
  darkColor,
  dark,
  animate = true,
  style,
  fallback,
}: SkeletonProps) {
  const systemScheme = useColorScheme()
  // If `dark` prop is provided, use it. Otherwise fall back to system scheme.
  const isDark = dark ?? systemScheme === 'dark'

  const [containerWidth, setContainerWidth] = useState(0)

  // Colors that match the boneyard web demo appearance:
  // Regular bones: visible but soft grey
  // Container bones (c:true): lighter than regular so child bones stand out
  const boneColor = isDark
    ? (darkColor ?? '#3a3a3c')
    : (color ?? '#d4d4d4')
  const bonePulseColor = isDark ? '#4a4a4c' : '#e4e4e4'
  const containerColor = isDark ? '#2c2c2e' : '#e8e8e8'
  const containerPulseColor = isDark ? '#3a3a3c' : '#f0f0f0'

  const pulseAnim = usePulseAnimation(loading && animate)

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width } = e.nativeEvent.layout
    setContainerWidth(Math.round(width))
  }, [])

  // Resolve bones: explicit initialBones > registry lookup
  const effectiveBones = initialBones ?? (name ? bonesRegistry.get(name) : undefined)
  const { width: screenWidth } = useWindowDimensions()

  const activeBones = effectiveBones
    ? resolveResponsive(effectiveBones, screenWidth)
    : null

  const showSkeleton = loading && activeBones
  const showFallback = loading && !activeBones

  const boneHeight = activeBones?.height ?? 0

  return (
    <View style={[styles.container, style]} onLayout={onLayout}>
      {showSkeleton ? (
        <View style={{ width: '100%', height: boneHeight }}>
          {activeBones.bones.map((b: Bone, i: number) => {
            const borderRadius = typeof b.r === 'number'
              ? b.r
              : b.r === '50%'
                ? Math.min(
                    containerWidth > 0 ? (b.w / 100) * containerWidth : b.h,
                    b.h,
                  ) / 2
                : (parseFloat(b.r) || 0)

            // Container bones are lighter, regular bones are the base color
            const base = b.c ? containerColor : boneColor
            const pulse = b.c ? containerPulseColor : bonePulseColor

            return (
              <View
                key={i}
                style={{
                  position: 'absolute',
                  left: `${b.x}%`,
                  top: b.y,
                  width: `${b.w}%`,
                  height: b.h,
                  borderRadius,
                  backgroundColor: base,
                  overflow: 'hidden',
                }}
              >
                {animate && (
                  <Animated.View
                    style={{
                      ...StyleSheet.absoluteFillObject,
                      backgroundColor: pulse,
                      opacity: pulseAnim,
                    }}
                  />
                )}
              </View>
            )
          })}
        </View>
      ) : showFallback ? (
        fallback ?? null
      ) : (
        children
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
})

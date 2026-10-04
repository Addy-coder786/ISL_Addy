/**
 * Core animation types for sign language gesture system
 * Defines the structure for skeletal animation data
 */

/**
 * Animation instruction tuple structure:
 * [boneName, transformType, axis, targetValue, direction]
 *
 * @example
 * ["mixamorigRightHand", "rotation", "x", Math.PI/2, "+"]
 * Rotates the right hand bone around X-axis to PI/2 radians in positive direction
 */
export type AnimationInstruction = [
    string, // Bone identifier in the 3D model skeleton
    "rotation" | "position" | "scale", // Type of transformation to apply
    "x" | "y" | "z", // Axis of transformation
    number, // Target value for the transformation
    "+" | "-", // Direction: + for increment, - for decrement
];

/**
 * Collection of animation instructions that execute together
 * Forms one frame or step in the gesture animation sequence
 */
export type AnimationFrame = AnimationInstruction[];

/**
 * Animation context reference containing the scene state
 * Used to manage animation queue and 3D scene objects
 */
export interface AnimationContext {
    animations: (AnimationFrame | string[])[]; // Queue of pending animation frames
    avatar: any; // Three.js 3D model object with skeleton
    pending: boolean; // Flag indicating if animation loop is running
    animate: () => void; // Main animation loop function
    scene?: any; // Three.js scene object
    camera?: any; // Three.js camera object
    renderer?: any; // Three.js WebGL renderer
    flag?: boolean; // Pause flag between gestures
    boneNameMap?: Record<string, string>; // optional mapping from shorthand to rig bone names
}

/**
 * Gesture animation function signature
 * Takes animation context and adds gesture frames to the queue
 *
 * @param context - Animation context with scene and queue
 */
export type GestureAnimationFn = (context: AnimationContext) => void;

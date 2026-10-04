import type { AnimationContext, AnimationFrame } from "../types";

/**
 * ISL gesture animation for letter 'A'
 * Defines skeletal transformations for sign language gesture
 */
export const createLetterA = (context: AnimationContext): void => {
    // Frame 1: Execute gesture movement - Both fists touching at knuckles in front of chest
    const gestureFrame: AnimationFrame = [
        // Right hand - form a fist
        ["mixamorigRightHandIndex1", "rotation", "z", Math.PI / 1.8, "+"],
        ["mixamorigRightHandIndex2", "rotation", "z", Math.PI / 1.8, "+"],
        ["mixamorigRightHandIndex3", "rotation", "z", Math.PI / 1.8, "+"],
        ["mixamorigRightHandMiddle1", "rotation", "z", Math.PI / 1.8, "+"],
        ["mixamorigRightHandMiddle2", "rotation", "z", Math.PI / 1.8, "+"],
        ["mixamorigRightHandMiddle3", "rotation", "z", Math.PI / 1.8, "+"],
        ["mixamorigRightHandRing1", "rotation", "z", Math.PI / 1.8, "+"],
        ["mixamorigRightHandRing2", "rotation", "z", Math.PI / 1.8, "+"],
        ["mixamorigRightHandRing3", "rotation", "z", Math.PI / 1.8, "+"],
        ["mixamorigRightHandPinky1", "rotation", "z", Math.PI / 1.8, "+"],
        ["mixamorigRightHandPinky2", "rotation", "z", Math.PI / 1.8, "+"],
        ["mixamorigRightHandPinky3", "rotation", "z", Math.PI / 1.8, "+"],
        ["mixamorigRightHandThumb1", "rotation", "x", Math.PI / 6, "+"],
        ["mixamorigRightHandThumb2", "rotation", "y", -Math.PI / 3, "-"],
        ["mixamorigRightHandThumb3", "rotation", "y", -Math.PI / 3, "-"],
        // Right hand positioning - angled to meet left fist
        ["mixamorigRightHand", "rotation", "z", -Math.PI / 10, "-"],
        ["mixamorigRightHand", "rotation", "y", Math.PI / 6, "+"],
        // Right forearm - bring to chest level, slight gap
        ["mixamorigRightForeArm", "rotation", "z", Math.PI / 6, "+"],
        ["mixamorigRightForeArm", "rotation", "x", Math.PI / 18, "+"],
        // Right arm - position at chest
        ["mixamorigRightArm", "rotation", "x", -Math.PI / 6.5, "-"],
        // Left hand - form a fist
        ["mixamorigLeftHandIndex1", "rotation", "z", -Math.PI / 1.8, "-"],
        ["mixamorigLeftHandIndex2", "rotation", "z", -Math.PI / 1.8, "-"],
        ["mixamorigLeftHandIndex3", "rotation", "z", -Math.PI / 1.8, "-"],
        ["mixamorigLeftHandMiddle1", "rotation", "z", -Math.PI / 1.8, "-"],
        ["mixamorigLeftHandMiddle2", "rotation", "z", -Math.PI / 1.8, "-"],
        ["mixamorigLeftHandMiddle3", "rotation", "z", -Math.PI / 1.8, "-"],
        ["mixamorigLeftHandRing1", "rotation", "z", -Math.PI / 1.8, "-"],
        ["mixamorigLeftHandRing2", "rotation", "z", -Math.PI / 1.8, "-"],
        ["mixamorigLeftHandRing3", "rotation", "z", -Math.PI / 1.8, "-"],
        ["mixamorigLeftHandPinky1", "rotation", "z", -Math.PI / 1.8, "-"],
        ["mixamorigLeftHandPinky2", "rotation", "z", -Math.PI / 1.8, "-"],
        ["mixamorigLeftHandPinky3", "rotation", "z", -Math.PI / 1.8, "-"],
        ["mixamorigLeftHandThumb1", "rotation", "x", Math.PI / 6, "+"],
        ["mixamorigLeftHandThumb2", "rotation", "y", Math.PI / 3, "+"],
        ["mixamorigLeftHandThumb3", "rotation", "y", Math.PI / 3, "+"],
        // Left hand positioning - angled to meet right fist
        ["mixamorigLeftHand", "rotation", "z", Math.PI / 10, "+"],
        ["mixamorigLeftHand", "rotation", "y", -Math.PI / 6, "-"],
        // Left forearm - bring to chest level, slight gap
        ["mixamorigLeftForeArm", "rotation", "z", -Math.PI / 6, "-"],
        ["mixamorigLeftForeArm", "rotation", "x", Math.PI / 18, "+"],
        // Left arm - position at chest
        ["mixamorigLeftArm", "rotation", "x", -Math.PI / 6.5, "-"],
    ];

    context.animations.push(gestureFrame);

    // Frame 2: Return to neutral position
    const resetFrame: AnimationFrame = [
        ["mixamorigRightHandIndex1", "rotation", "z", 0, "-"],
        ["mixamorigRightHandIndex2", "rotation", "z", 0, "-"],
        ["mixamorigRightHandIndex3", "rotation", "z", 0, "-"],
        ["mixamorigRightHandMiddle1", "rotation", "z", 0, "-"],
        ["mixamorigRightHandMiddle2", "rotation", "z", 0, "-"],
        ["mixamorigRightHandMiddle3", "rotation", "z", 0, "-"],
        ["mixamorigRightHandRing1", "rotation", "z", 0, "-"],
        ["mixamorigRightHandRing2", "rotation", "z", 0, "-"],
        ["mixamorigRightHandRing3", "rotation", "z", 0, "-"],
        ["mixamorigRightHandPinky1", "rotation", "z", 0, "-"],
        ["mixamorigRightHandPinky2", "rotation", "z", 0, "-"],
        ["mixamorigRightHandPinky3", "rotation", "z", 0, "-"],
        ["mixamorigRightHandThumb1", "rotation", "x", 0, "-"],
        ["mixamorigRightHandThumb2", "rotation", "y", 0, "+"],
        ["mixamorigRightHandThumb3", "rotation", "y", 0, "+"],
        ["mixamorigRightHand", "rotation", "z", 0, "+"],
        ["mixamorigRightHand", "rotation", "y", 0, "-"],
        ["mixamorigRightForeArm", "rotation", "z", 0, "-"],
        ["mixamorigRightForeArm", "rotation", "x", 0, "-"],
        ["mixamorigRightArm", "rotation", "x", 0, "+"],
        ["mixamorigLeftHandIndex1", "rotation", "z", 0, "+"],
        ["mixamorigLeftHandIndex2", "rotation", "z", 0, "+"],
        ["mixamorigLeftHandIndex3", "rotation", "z", 0, "+"],
        ["mixamorigLeftHandMiddle1", "rotation", "z", 0, "+"],
        ["mixamorigLeftHandMiddle2", "rotation", "z", 0, "+"],
        ["mixamorigLeftHandMiddle3", "rotation", "z", 0, "+"],
        ["mixamorigLeftHandRing1", "rotation", "z", 0, "+"],
        ["mixamorigLeftHandRing2", "rotation", "z", 0, "+"],
        ["mixamorigLeftHandRing3", "rotation", "z", 0, "+"],
        ["mixamorigLeftHandPinky1", "rotation", "z", 0, "+"],
        ["mixamorigLeftHandPinky2", "rotation", "z", 0, "+"],
        ["mixamorigLeftHandPinky3", "rotation", "z", 0, "+"],
        ["mixamorigLeftHandThumb1", "rotation", "x", 0, "-"],
        ["mixamorigLeftHandThumb2", "rotation", "y", 0, "-"],
        ["mixamorigLeftHandThumb3", "rotation", "y", 0, "-"],
        ["mixamorigLeftHand", "rotation", "z", 0, "-"],
        ["mixamorigLeftHand", "rotation", "y", 0, "+"],
        ["mixamorigLeftForeArm", "rotation", "z", 0, "+"],
        ["mixamorigLeftForeArm", "rotation", "x", 0, "-"],
        ["mixamorigLeftArm", "rotation", "x", 0, "+"],
    ];

    context.animations.push(resetFrame);

    // Initialize animation loop if not already active
    if (context.pending === false) {
        context.pending = true;
        context.animate();
    }
};

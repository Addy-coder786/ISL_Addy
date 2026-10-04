import type { AnimationContext, AnimationFrame } from "../types";

/**
 * ISL gesture animation for word 'TIME'
 * Multi-frame sequence for complete word gesture
 */
export const createWordTime = (context: AnimationContext): void => {
    // Animation frame 1
    const frame1: AnimationFrame = [
        ["mixamorig:LeftHandIndex1", "rotation", "z", -Math.PI / 2, "-"],
        ["mixamorig:LeftHandIndex2", "rotation", "z", -Math.PI / 2, "-"],
        ["mixamorig:LeftHandIndex3", "rotation", "z", -Math.PI / 2, "-"],
        ["mixamorig:LeftHandMiddle1", "rotation", "z", -Math.PI / 2, "-"],
        ["mixamorig:LeftHandMiddle2", "rotation", "z", -Math.PI / 2, "-"],
        ["mixamorig:LeftHandMiddle3", "rotation", "z", -Math.PI / 2, "-"],
        ["mixamorig:LeftHandRing1", "rotation", "z", -Math.PI / 2, "-"],
        ["mixamorig:LeftHandRing2", "rotation", "z", -Math.PI / 2, "-"],
        ["mixamorig:LeftHandRing3", "rotation", "z", -Math.PI / 2, "-"],
        ["mixamorig:LeftHandPinky1", "rotation", "z", -Math.PI / 2, "-"],
        ["mixamorig:LeftHandPinky2", "rotation", "z", -Math.PI / 2, "-"],
        ["mixamorig:LeftHandPinky3", "rotation", "z", -Math.PI / 2, "-"],
        ["mixamorig:LeftHandThumb1", "rotation", "y", -Math.PI / 4, "-"],
        ["mixamorig:LeftForeArm", "rotation", "z", -Math.PI / 4, "-"],
        ["mixamorig:LeftArm", "rotation", "z", -Math.PI / 2.5, "-"],
        ["mixamorig:LeftHand", "rotation", "x", Math.PI / 6, "+"],
        ["mixamorig:RightHandIndex1", "rotation", "z", Math.PI / 2, "+"],
        ["mixamorig:RightHandMiddle1", "rotation", "z", Math.PI / 2, "+"],
        ["mixamorig:RightHandMiddle2", "rotation", "z", Math.PI / 2, "+"],
        ["mixamorig:RightHandMiddle3", "rotation", "z", Math.PI / 2, "+"],
        ["mixamorig:RightHandRing1", "rotation", "z", Math.PI / 2, "+"],
        ["mixamorig:RightHandRing2", "rotation", "z", Math.PI / 2, "+"],
        ["mixamorig:RightHandRing3", "rotation", "z", Math.PI / 2, "+"],
        ["mixamorig:RightHandPinky1", "rotation", "z", Math.PI / 2, "+"],
        ["mixamorig:RightHandPinky2", "rotation", "z", Math.PI / 2, "+"],
        ["mixamorig:RightHandPinky3", "rotation", "z", Math.PI / 2, "+"],
        ["mixamorig:RightArm", "rotation", "z", Math.PI / 3.5, "+"],
        ["mixamorig:RightArm", "rotation", "y", Math.PI / 9, "+"],
        ["mixamorig:RightForeArm", "rotation", "z", Math.PI / 12, "+"],
        ["mixamorig:RightHand", "rotation", "x", Math.PI / 6, "+"],
        ["mixamorig:RightHand", "rotation", "y", Math.PI / 6, "+"],
    ];

    context.animations.push(frame1);

    // Animation frame 2
    const frame2: AnimationFrame = [
        ["mixamorig:RightForeArm", "rotation", "z", 0, "-"],
    ];

    context.animations.push(frame2);

    // Animation frame 3
    const frame3: AnimationFrame = [
        ["mixamorig:RightForeArm", "rotation", "z", Math.PI / 12, "+"],
    ];

    context.animations.push(frame3);

    // Animation frame 4
    const frame4: AnimationFrame = [
        ["mixamorig:LeftHandIndex1", "rotation", "z", 0, "+"],
        ["mixamorig:LeftHandIndex2", "rotation", "z", 0, "+"],
        ["mixamorig:LeftHandIndex3", "rotation", "z", 0, "+"],
        ["mixamorig:LeftHandMiddle1", "rotation", "z", 0, "+"],
        ["mixamorig:LeftHandMiddle2", "rotation", "z", 0, "+"],
        ["mixamorig:LeftHandMiddle3", "rotation", "z", 0, "+"],
        ["mixamorig:LeftHandRing1", "rotation", "z", 0, "+"],
        ["mixamorig:LeftHandRing2", "rotation", "z", 0, "+"],
        ["mixamorig:LeftHandRing3", "rotation", "z", 0, "+"],
        ["mixamorig:LeftHandPinky1", "rotation", "z", 0, "+"],
        ["mixamorig:LeftHandPinky2", "rotation", "z", 0, "+"],
        ["mixamorig:LeftHandPinky3", "rotation", "z", 0, "+"],
        ["mixamorig:LeftHandThumb1", "rotation", "y", 0, "+"],
        ["mixamorig:LeftForeArm", "rotation", "z", 0, "+"],
        ["mixamorig:LeftArm", "rotation", "z", -Math.PI / 3, "+"],
        ["mixamorig:LeftHand", "rotation", "x", 0, "-"],
        ["mixamorig:RightHandIndex1", "rotation", "z", 0, "-"],
        ["mixamorig:RightHandMiddle1", "rotation", "z", 0, "-"],
        ["mixamorig:RightHandMiddle2", "rotation", "z", 0, "-"],
        ["mixamorig:RightHandMiddle3", "rotation", "z", 0, "-"],
        ["mixamorig:RightHandRing1", "rotation", "z", 0, "-"],
        ["mixamorig:RightHandRing2", "rotation", "z", 0, "-"],
        ["mixamorig:RightHandRing3", "rotation", "z", 0, "-"],
        ["mixamorig:RightHandPinky1", "rotation", "z", 0, "-"],
        ["mixamorig:RightHandPinky2", "rotation", "z", 0, "-"],
        ["mixamorig:RightHandPinky3", "rotation", "z", 0, "-"],
        ["mixamorig:RightArm", "rotation", "z", Math.PI / 3, "-"],
        ["mixamorig:RightArm", "rotation", "y", 0, "-"],
        ["mixamorig:RightForeArm", "rotation", "z", 0, "-"],
        ["mixamorig:RightHand", "rotation", "x", 0, "-"],
        ["mixamorig:RightHand", "rotation", "y", 0, "-"],
    ];

    context.animations.push(frame4);

    // Initialize animation loop if not already active
    if (context.pending === false) {
        context.pending = true;
        context.animate();
    }
};

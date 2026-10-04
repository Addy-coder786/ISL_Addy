import type { AnimationContext, AnimationFrame } from "../types";

/**
 * ISL gesture animation for 'Namaste'
 * Defines skeletal transformations for the traditional Indian greeting
 */
export const createWordNamaste = (context: AnimationContext): void => {
    // Frame 1: Execute gesture movement
    const gestureFrame: AnimationFrame = [
        // Right Arm (Based on 'B' but closer)
        ["mixamorig:RightArm", "rotation", "x", -Math.PI / 6.5, "-"],
        ["mixamorig:RightArm", "rotation", "z", Math.PI / 3 + 0.25, "+"], // Bring arm closer to body
        ["mixamorig:RightForeArm", "rotation", "z", Math.PI / 7, "+"], // Bend elbow slightly more
        ["mixamorig:RightForeArm", "rotation", "x", Math.PI / 18, "+"],
        ["mixamorig:RightHand", "rotation", "z", -Math.PI / 10, "-"],
        ["mixamorig:RightHand", "rotation", "y", Math.PI / 4, "+"], // Rotate wrist to face palm inward

        // Left Arm (Based on 'B' but closer)
        ["mixamorig:LeftArm", "rotation", "x", -Math.PI / 6.5, "-"],
        ["mixamorig:LeftArm", "rotation", "z", -Math.PI / 3 - 0.25, "-"], // Bring arm closer to body
        ["mixamorig:LeftForeArm", "rotation", "z", -Math.PI / 7, "-"], // Bend elbow slightly more
        ["mixamorig:LeftForeArm", "rotation", "x", Math.PI / 18, "+"],
        ["mixamorig:LeftHand", "rotation", "z", Math.PI / 10, "+"],
        ["mixamorig:LeftHand", "rotation", "y", -Math.PI / 4, "-"], // Rotate wrist to face palm inward

        // Fingers (Straighten/Relax - Namaste is flat hands)
        // Right Hand
        ["mixamorig:RightHandIndex1", "rotation", "z", 0, "-"],
        ["mixamorig:RightHandIndex2", "rotation", "z", 0, "-"],
        ["mixamorig:RightHandIndex3", "rotation", "z", 0, "-"],
        ["mixamorig:RightHandMiddle1", "rotation", "z", 0, "-"],
        ["mixamorig:RightHandMiddle2", "rotation", "z", 0, "-"],
        ["mixamorig:RightHandMiddle3", "rotation", "z", 0, "-"],
        ["mixamorig:RightHandRing1", "rotation", "z", 0, "-"],
        ["mixamorig:RightHandRing2", "rotation", "z", 0, "-"],
        ["mixamorig:RightHandRing3", "rotation", "z", 0, "-"],
        ["mixamorig:RightHandPinky1", "rotation", "z", 0, "-"],
        ["mixamorig:RightHandPinky2", "rotation", "z", 0, "-"],
        ["mixamorig:RightHandPinky3", "rotation", "z", 0, "-"],
        ["mixamorig:RightHandThumb1", "rotation", "x", 0, "-"],
        ["mixamorig:RightHandThumb2", "rotation", "y", 0, "-"],

        // Left Hand
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
        ["mixamorig:LeftHandThumb1", "rotation", "x", 0, "+"],
        ["mixamorig:LeftHandThumb2", "rotation", "y", 0, "+"],
    ];

    context.animations.push(gestureFrame);

    // Frame 2: Return to neutral position
    const resetFrame: AnimationFrame = [
        // Right Arm
        ["mixamorig:RightArm", "rotation", "x", 0, "+"],
        ["mixamorig:RightArm", "rotation", "z", Math.PI / 3, "+"], // Reset to default
        ["mixamorigRightForeArm", "rotation", "z", 0, "-"],
        ["mixamorigRightForeArm", "rotation", "x", 0, "-"],
        ["mixamorigRightHand", "rotation", "z", 0, "+"],
        ["mixamorigRightHand", "rotation", "y", 0, "-"],

        // Left Arm
        ["mixamorig:LeftArm", "rotation", "x", 0, "+"],
        ["mixamorig:LeftArm", "rotation", "z", -Math.PI / 3, "-"], // Reset to default
        ["mixamorigLeftForeArm", "rotation", "z", 0, "+"],
        ["mixamorigLeftForeArm", "rotation", "x", 0, "-"],
        ["mixamorigLeftHand", "rotation", "z", 0, "-"],
        ["mixamorigLeftHand", "rotation", "y", 0, "+"],

        // Fingers
        ["mixamorigRightHandIndex1", "rotation", "z", 0, "+"],
        ["mixamorigRightHandIndex2", "rotation", "z", 0, "+"],
        ["mixamorigRightHandIndex3", "rotation", "z", 0, "+"],
        ["mixamorigRightHandMiddle1", "rotation", "z", 0, "+"],
        ["mixamorigRightHandMiddle2", "rotation", "z", 0, "+"],
        ["mixamorigRightHandMiddle3", "rotation", "z", 0, "+"],
        ["mixamorigRightHandRing1", "rotation", "z", 0, "+"],
        ["mixamorigRightHandRing2", "rotation", "z", 0, "+"],
        ["mixamorigRightHandRing3", "rotation", "z", 0, "+"],
        ["mixamorigRightHandPinky1", "rotation", "z", 0, "+"],
        ["mixamorigRightHandPinky2", "rotation", "z", 0, "+"],
        ["mixamorigRightHandPinky3", "rotation", "z", 0, "+"],
        ["mixamorigRightHandThumb1", "rotation", "x", 0, "+"],
        ["mixamorigRightHandThumb2", "rotation", "y", 0, "+"],

        ["mixamorigLeftHandIndex1", "rotation", "z", 0, "-"],
        ["mixamorigLeftHandIndex2", "rotation", "z", 0, "-"],
        ["mixamorigLeftHandIndex3", "rotation", "z", 0, "-"],
        ["mixamorigLeftHandMiddle1", "rotation", "z", 0, "-"],
        ["mixamorigLeftHandMiddle2", "rotation", "z", 0, "-"],
        ["mixamorigLeftHandMiddle3", "rotation", "z", 0, "-"],
        ["mixamorigLeftHandRing1", "rotation", "z", 0, "-"],
        ["mixamorigLeftHandRing2", "rotation", "z", 0, "-"],
        ["mixamorigLeftHandRing3", "rotation", "z", 0, "-"],
        ["mixamorigLeftHandPinky1", "rotation", "z", 0, "-"],
        ["mixamorigLeftHandPinky2", "rotation", "z", 0, "-"],
        ["mixamorigLeftHandPinky3", "rotation", "z", 0, "-"],
        ["mixamorigLeftHandThumb1", "rotation", "x", 0, "-"],
        ["mixamorigLeftHandThumb2", "rotation", "y", 0, "-"],
    ];

    context.animations.push(resetFrame);

    // Initialize animation loop if not already active
    if (context.pending === false) {
        context.pending = true;
        context.animate();
    }
};

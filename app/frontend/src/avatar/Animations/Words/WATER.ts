import type { AnimationContext, AnimationFrame } from "../types";
import { setDefaultPose } from "../defaultPose";

/**
 * ISL gesture animation for word 'WATER' (Official ISLRTC Lexicon)
 * W-handshape near chin (Index, Middle, Ring extended; Thumb holding Pinky)
 * with gentle double tap near the chin.
 */
export const createWordWater = (context: AnimationContext): void => {
    // Bring right hand up to chin level in W-handshape
    const frame1: AnimationFrame = [
        // Upper arm lift toward chest/chin
        ["mixamorig:RightArm", "rotation", "x", -Math.PI / 3.2, "-"],
        ["mixamorig:RightArm", "rotation", "z", Math.PI / 6, "+"],
        // Forearm angled upward toward chin
        ["mixamorig:RightForeArm", "rotation", "x", Math.PI / 3, "+"],
        // Hand rotated with palm facing inwards/sideways toward mouth
        ["mixamorig:RightHand", "rotation", "y", Math.PI / 4, "+"],
        ["mixamorig:RightHand", "rotation", "z", -Math.PI / 10, "-"],
        
        // W-shape: Index, Middle, Ring fully extended
        ["mixamorig:RightHandIndex1", "rotation", "z", 0, "+"],
        ["mixamorig:RightHandIndex2", "rotation", "z", 0, "+"],
        ["mixamorig:RightHandIndex3", "rotation", "z", 0, "+"],

        ["mixamorig:RightHandMiddle1", "rotation", "z", 0, "+"],
        ["mixamorig:RightHandMiddle2", "rotation", "z", 0, "+"],
        ["mixamorig:RightHandMiddle3", "rotation", "z", 0, "+"],

        ["mixamorig:RightHandRing1", "rotation", "z", 0, "+"],
        ["mixamorig:RightHandRing2", "rotation", "z", 0, "+"],
        ["mixamorig:RightHandRing3", "rotation", "z", 0, "+"],

        // Pinky folded and held by thumb
        ["mixamorig:RightHandPinky1", "rotation", "z", Math.PI / 2, "+"],
        ["mixamorig:RightHandPinky2", "rotation", "z", Math.PI / 2, "+"],
        ["mixamorig:RightHandThumb1", "rotation", "y", Math.PI / 3, "+"],
    ];

    context.animations.push(frame1);

    // Tap 1: slight move toward chin
    const tapIn1: AnimationFrame = [
        ["mixamorig:RightHand", "rotation", "x", Math.PI / 12, "+"],
    ];
    context.animations.push(tapIn1);

    // Tap 1 back: slight release
    const tapOut1: AnimationFrame = [
        ["mixamorig:RightHand", "rotation", "x", 0, "-"],
    ];
    context.animations.push(tapOut1);

    // Tap 2: second tap on chin
    const tapIn2: AnimationFrame = [
        ["mixamorig:RightHand", "rotation", "x", Math.PI / 12, "+"],
    ];
    context.animations.push(tapIn2);

    // Return to neutral default pose
    setDefaultPose(context);

    if (context.pending === false) {
        context.pending = true;
        if (typeof context.animate === "function") {
            context.animate();
        }
    }
};

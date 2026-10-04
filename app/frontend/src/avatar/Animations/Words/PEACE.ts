import type { AnimationContext, AnimationFrame } from "../types";
import { setDefaultPose } from "../defaultPose";

/**
 * ISL gesture animation for word 'PEACE' / Victory (Official ISLRTC Lexicon)
 * V-handshape: Index and Middle fingers extended upright in V-formation,
 * Ring and Pinky folded into palm, palm facing front toward conversational partner.
 */
export const createWordPeace = (context: AnimationContext): void => {
    const frame1: AnimationFrame = [
        // Lift right arm to mid-chest / shoulder height
        ["mixamorig:RightArm", "rotation", "x", -Math.PI / 3.2, "-"],
        ["mixamorig:RightArm", "rotation", "z", Math.PI / 5, "+"],
        ["mixamorig:RightForeArm", "rotation", "x", Math.PI / 3.5, "+"],
        
        // Palm facing outward
        ["mixamorig:RightHand", "rotation", "y", Math.PI / 3, "+"],
        ["mixamorig:RightHand", "rotation", "z", -Math.PI / 12, "-"],

        // Index and Middle extended in V-shape
        ["mixamorig:RightHandIndex1", "rotation", "z", -Math.PI / 16, "-"],
        ["mixamorig:RightHandIndex2", "rotation", "z", 0, "+"],
        ["mixamorig:RightHandIndex3", "rotation", "z", 0, "+"],

        ["mixamorig:RightHandMiddle1", "rotation", "z", Math.PI / 16, "+"],
        ["mixamorig:RightHandMiddle2", "rotation", "z", 0, "+"],
        ["mixamorig:RightHandMiddle3", "rotation", "z", 0, "+"],

        // Ring and Pinky curled tight into palm
        ["mixamorig:RightHandRing1", "rotation", "z", Math.PI / 1.8, "+"],
        ["mixamorig:RightHandRing2", "rotation", "z", Math.PI / 2, "+"],
        ["mixamorig:RightHandPinky1", "rotation", "z", Math.PI / 1.8, "+"],
        ["mixamorig:RightHandPinky2", "rotation", "z", Math.PI / 2, "+"],
        ["mixamorig:RightHandThumb1", "rotation", "y", Math.PI / 2, "+"],
    ];

    context.animations.push(frame1);

    // Hold steady
    context.animations.push([]);

    // Return to neutral pose
    setDefaultPose(context);

    if (context.pending === false) {
        context.pending = true;
        if (typeof context.animate === "function") {
            context.animate();
        }
    }
};

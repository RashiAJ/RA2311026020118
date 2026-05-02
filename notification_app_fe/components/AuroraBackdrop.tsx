"use client";

import dynamic from "next/dynamic";
import { Box } from "@mui/material";

const Aurora = dynamic(() => import("@/components/reactbits/Aurora"), { ssr: false, loading: () => null });

/**
 * Full-viewport React Bits Aurora (WebGL via ogl). Fixed behind app content.
 */
export function AuroraBackdrop() {
  return (
    <Box
      aria-hidden
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
        "& canvas": { display: "block" },
      }}
    >
      <Box sx={{ width: "100%", height: "100%", minHeight: "100vh" }}>
        <Aurora
          colorStops={["#312e81", "#0e7490", "#5b21b6"]}
          amplitude={1.12}
          blend={0.48}
          speed={0.85}
        />
      </Box>
    </Box>
  );
}

import fs from "fs";

export const cleanupFiles = (...files) => {
  files.forEach((file) => {
    fs.unlink(file, (err) => {
      if (err) console.warn("⚠️ Failed to delete:", file);
    });
  });
};

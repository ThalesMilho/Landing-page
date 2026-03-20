# 📅 Escalas Directory

## Fixed URL Architecture

This directory contains the monthly HR schedule PDFs that are accessible via fixed URLs.

## Files Expected:

- `escala-pronto-socorro.pdf` - Current schedule for Pronto Socorro
- `escala-cme.pdf` - Current schedule for CME (Central de Material Esterilizado)

## How to Update Monthly:

1. **Replace the PDF files** with the new monthly schedules
2. **Keep the same filenames** - no code changes needed
3. **The application will automatically** serve the updated files

## URL Access:

- http://localhost:5173/escalas/escala-pronto-socorro.pdf
- http://localhost:5173/escalas/escala-cme.pdf

## Benefits:

✅ **No code changes required** for monthly updates  
✅ **Fixed URLs** that never change  
✅ **HR team can simply overwrite files**  
✅ **Immediate availability** once files are updated  

## Deployment:

On production server, ensure these files are placed in:
`/public/escalas/` directory of the built application.

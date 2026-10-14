# Model artifacts

Model binaries are intentionally kept outside normal source history. Provision
the approved neural super-resolution artifact with:

```powershell
.\install-sesr-model.ps1
```

The script downloads `SESR_int8.onnx` from the official AMD `amd/sesr` model
repository and verifies the published SHA-256 before moving it into this
directory. The model card identifies the artifact as Apache-2.0 and documents
the x2 SESR inference path. Do not replace it with Real-ESRGAN weights or with
an unverified mirror.

Provenance:

- Model card and artifact: <https://huggingface.co/amd/sesr>
- Source SESR project: <https://github.com/ARM-software/sesr>
- Source project license: Apache License 2.0 (`LICENSE.txt`)
- Runtime: ONNX Runtime, MIT

The model file is ignored by Git. Keep the downloaded checksum and provenance
in this document and in the installer script.

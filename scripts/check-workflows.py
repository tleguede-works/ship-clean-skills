#!/usr/bin/env python3
"""Vérifie que chaque bloc `run:` d'un workflow est du bash syntaxiquement valide.

Un workflow dont un `run:` n'est pas du bash valide passe la contrôle YAML, puis
meurt **sur le runner**, après avoir poussé le tag et commité VERSION/CHANGELOG.
C'est-à-dire qu'il a déjà modifié l'état du dépôt quand il s'arrête — et le
message d'erreur parle de la dernière ligne, pas de la cause.

Constaté en conditions réelles : le job de release est mort entre `git push origin
"$TAG"` et `gh release create`, laissant un tag orphelin et aucune release.

Ce contrôle déplace l'échec de « après le tag » à « avant la publication ».

Zéro dépendance hors PyYAML, déjà présent sur le runner.
"""

import glob
import os
import subprocess
import sys
import tempfile

import yaml

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def neutralise(expr: str) -> str:
    """Remplace les expressions GitHub par une forme shell neutre.

    `${{ steps.x.outputs.y }}` n'est pas du bash — on le transforme en
    `${steps_x_outputs_y}`, qui l'est, pour que le reste du bloc soit vérifié.
    Le reste du bloc est justement ce qu'on veut vérifier.
    """

    # Version simple et robuste : substitution par expression régulière.
    import re

    def repl(m):
        return "${" + re.sub(r"[^A-Za-z0-9_]", "_", m.group(1)) + "}"

    return re.sub(r"\$\{\{(.*?)\}\}", repl, expr, flags=re.S)


def main() -> int:
    files = sorted(glob.glob(os.path.join(ROOT, ".github/workflows/*.yml")))
    if not files:
        print("aucun workflow trouvé", file=sys.stderr)
        return 1

    problems = []
    checked = 0

    for f in files:
        rel = os.path.relpath(f, ROOT)
        with open(f, encoding="utf-8") as fh:
            doc = yaml.safe_load(fh)
        for job_name, job in (doc.get("jobs") or {}).items():
            for step in job.get("steps") or []:
                if "run" not in step:
                    continue
                checked += 1
                label = "%s :: %s :: %s" % (rel, job_name, step.get("name", "?"))
                body = neutralise(step["run"])
                with tempfile.NamedTemporaryFile("w", suffix=".sh", delete=False, encoding="utf-8") as tmp:
                    tmp.write("# " + label + "\n")
                    tmp.write(body)
                    path = tmp.name
                proc = subprocess.run(["bash", "-n", path], capture_output=True, text=True)
                os.unlink(path)
                if proc.returncode != 0:
                    problems.append({"step": label, "error": proc.stderr.strip().splitlines()[:4]})

    print(yaml.safe_dump({"workflows": len(files), "run_blocks": checked, "problems": problems},
                         sort_keys=True, allow_unicode=True))
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
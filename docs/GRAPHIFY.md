# Graphify Setup

Graphify is installed locally through the Python environment at:

```text
/home/ubuntu/.local/share/pipx/venvs/graphifyy/bin/python
```

From the project root:

```bash
cd /home/ubuntu/apps/cricket-manager-lite
graphify . --code-only
graphify cluster-only .
graphify export html
```

Outputs are generated in `graphify-out/`:

```text
graphify-out/graph.html
graphify-out/GRAPH_REPORT.md
graphify-out/graph.json
```

`graphify-out/` is intentionally ignored by Git because it is generated tooling output.

Useful queries:

```bash
graphify query "How does the simulation engine use conditions?"
graphify path "Condition Stack" "Simulation Modifiers"
graphify explain "Test Cricket Model"
```

Current limitation: the installed Graphify CLI requires an LLM API key for docs/images semantic extraction. Without one, use `--code-only` for local AST-based code graphs. In Codex, semantic extraction can also be run through subagents; future Graphify subagents should use `gpt-5.4-mini`.

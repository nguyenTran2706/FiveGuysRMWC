# Git in VS Code

This project is already a Git repository connected to [FiveGuysRMWC](https://github.com/nguyenTran2706/FiveGuysRMWC), with `main` tracking `origin/main`.

On this computer, Git for Windows is installed at `C:\Program Files\Git\cmd\git.exe` and is available on PATH. The workspace enables Git integration in `.vscode/settings.json`; this local settings file is excluded from Git.

1. Open `C:\Work\Case 2` with **File > Open Folder** in VS Code.
2. Press **Ctrl+Shift+P**, run **Developer: Reload Window**, then press **Ctrl+Shift+G** to open Source Control. If VS Code was open before Git was installed and still cannot find Git, close all VS Code windows and reopen it.
3. Review the changed files. Use **+** to stage the files you want to save, enter a commit message, and select **Commit**.
4. Select **Sync Changes** to pull remote commits and push your committed changes. The existing remote is `https://github.com/nguyenTran2706/FiveGuysRMWC.git`.

These actions are documented in the [official VS Code Git quickstart](https://code.visualstudio.com/docs/sourcecontrol/quickstart). See [repositories and remotes](https://code.visualstudio.com/docs/sourcecontrol/repos-remotes) for synchronization details.

If Git does not appear or a sync fails, run **Git: Show Git Output** from the Command Palette to see the detected executable and the error. Follow the [official troubleshooting guide](https://code.visualstudio.com/docs/sourcecontrol/troubleshooting).

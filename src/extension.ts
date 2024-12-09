import * as vscode from "vscode";

const emptyTodo = new TextEncoder().encode(`# ${"TODOs"}
 - Add todos here
`);

const getTodoFileProvider = ({
  workspaceState,
}: vscode.ExtensionContext): vscode.FileSystemProvider => {
  const unsupported = () => {
    throw new Error("Not supported");
  };

  return {
    readFile: ({ path }) => workspaceState.get(path, emptyTodo),
    writeFile: ({ path }, content) => workspaceState.update(path, content),
    delete: ({ path }) => workspaceState.update(path, undefined),

    stat: () => ({
      type: vscode.FileType.File,
      ctime: Date.now(),
      mtime: Date.now(),
      size: 0,
    }),
    readDirectory: () => [],
    createDirectory: unsupported,
    rename: unsupported,
    watch: () => new vscode.Disposable(() => {}),
    onDidChangeFile: new vscode.EventEmitter<vscode.FileChangeEvent[]>().event,
  };
};

export function activate(context: vscode.ExtensionContext) {
  vscode.workspace.registerFileSystemProvider(
    "project-todo",
    getTodoFileProvider(context)
  );

  const subscription = vscode.commands.registerCommand(
    "project-todo.open",
    async () => {
      const virtualFileUri = vscode.Uri.parse("project-todo:/TODOs.md");
      const doc = await vscode.workspace.openTextDocument(virtualFileUri);
      await vscode.window.showTextDocument(doc);
    }
  );

  context.subscriptions.push(subscription);
}

export function deactivate() {}

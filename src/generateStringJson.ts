import * as fs from 'fs';
import * as path from 'path';
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';

// 루트 JSON에 언어 코드 표기용
const CODE_ROOT_KEY: string = 'LOCALE-CODE';
const COMMIT_ID_KEY: string = ''; //커밋 구분 키를 넣어주세요.
const DESCRIPTION_KEY: string = 'DESC-KEY';
const DESCRIPTION_VALUE: string = 'This code adds internationalization (i18n) support to the source code. For more information, please visit the dedicated locale repository (https://github.com/agentkorea/locale).';

const LANGUAGES: string[] = ['en_US', 'ko_KR', 'zh_CN'];

// 언어별 번역자 설정 (LANGUAGES 배열을 참조하여 자동 생성)
const TRANSLATOR_BASE_VALUES: { [key: string]: string[] } = {
  'en_US': [''],
  'ko_KR': [''],
  'zh_CN': ['']
};


// 200자 초과 문자열 제외 길이(변경 가능)
const MAX_STRING_KEY_LENGTH: number = 200;
const MIN_STRING_KEY_LENGTH: number = 2;

// ID 시작값 (겹치지 않도록 파일 리스트와 구분 원하면 숫자를 다르게 두세요)
const FILE_ID_START_NUM: number | string = '1000';

// 출력 폴더 및 언어 목록 (generateJson.ts와 동일)
const OUTPUT_DIR: string = '../lang';

// LANGUAGES를 참조하여 TRANSLATOR_VALUES 자동 생성
const TRANSLATOR_VALUES: { [key: string]: string[] } = {};
LANGUAGES.forEach(lang => {
  TRANSLATOR_VALUES[lang] = TRANSLATOR_BASE_VALUES[lang] || [];
});

// 스캔 대상 루트 (프로젝트 루트 기준 sample 폴더)
const SAMPLE_DIR: string = '../../agentkorea';
const TARGET_PROJECT: string = 'target_project';  
const SCAN_ROOT_DIR: string = `${SAMPLE_DIR}/${TARGET_PROJECT}`;

// 제외할 항목들을 통합 관리
const EXCLUDED_ITEMS = {
  // 특정 파일 및 폴더 경로 (SCAN_ROOT_DIR 기준 또는 프로젝트 루트 기준)
  PATHS: [
    'packages/cli/src/generated/git-commit.ts',
    'scripts',
  ],
  
  // 제외할 디렉터리명
  DIRS: [
    'node_modules',
    'dist',
    'build',
    'bundle',
    '.git',
    '.github',
    '.vscode',
    '.gcp',
    '.gemini',
    'lang',
  ],
  
  // 제외할 파일명
  BASENAMES: [
    '.DS_Store',
    '.editorconfig',
    '.gitattributes',
    '.gitignore',
    '.npmrc',
    '.prettierrc.json',
    'eslint.config.js',
    'tsconfig.json',
    'package-lock.json',
    'esbuild.config.js',
    'output.json',
  ],
  
  // 문자열 필터링 (불필요한 일반 토큰 제외)
  STRINGS: [
    'gemini',
    'git',
    'root',
    'production',
    'development',
    'test',
    'source',
    'list',
    'name',
    'all',
    'bash',
    'yolo',
    'text',
    'component',
    '**/*.{ts,tsx}',
    'node_modules/**',
    '*.d.ts',
    'emacs',
    'vim',
    'image',
    'pdf',
    'audio',
    'video',
    'binary',
    'svg',
    'ping',
    'mts',
    'cts',
    'image/',
    'audio/',
    'video/',
    'tar',
    'tgz',
    'packages',
    'dll',
    'class',
    'jar',
    'war',
    'doc',
    'docx',
    'xls',
    'xlsx',
    'ppt',
    'pptx',
    'odt',
    'ods',
    'odp',
    'dat',
    'obj',
    'wasm',
    'pyc',
    'pyo',
    'quiet',
    'where',
    'const import_meta = { url',
    'require(\'url\')',
    'pathToFileURL(__filename)',
    'href };',
    'node_modules/',
    'command -v',
    '(http)',
    'wincmd h | set readonly | wincmd l',
    'set showtabline=2 | set tabline=[Instructions]\\',
    'wqa(save\\ &\\ quit)\\ \\|\\ i/esc(toggle\\ edit\\ mode)',
    'wincmd h | setlocal statusline=OLD\\ FILE',
    'wincmd l | setlocal statusline=%#StatusBold#NEW\\ FILE\\',
    'wqa(save\\ &\\ quit)\\ \\|\\ i/esc(toggle\\ edit\\ mode)',
    'autocmd WinClosed * wqa',
    '(ediff "',
    'application/pdf',
    'utf-8',
    'outputs',
    'module',
    'typescript',
    'jsx',
    '.',
    'output.json',
    'stats.session_goodbye',
    'true',
    'false',
    'TRUE',
    'FALSE',
    'http',
    'https', 
    'win32',
    'array',
    'extensions',
    'boolean',
    'number',
    'object',
    'proxy',
    'string',
    'port',
    'ext1',
    'ext2',
    'ext3',
    'none',
    'EXT1',
    'error',
    'ext4',
    'context',
    'none',
    'end',
    'home',
    'escape',
    'return',
    'quit',
    'exit',
    'tab',
    'raw',
    'img',
    'skip',
    'down',
    'docker',
    'podman',
    'linux',
    'server1',
    'server2',
    'server3',
    'tool1',
    'tool2',
    'tool3',
    'tool4',
    'tool5',
    'user',
    'abc',
    'project',
    'cli',
    'path1',
    'path2',
    'path3',
    'settings',
    '[DEBUG]',
    '[WARN]',
    'dark',
    'DEBUG',
    'warn',
    'ipv4first',
    'verbatim',
    'valueA',
    'valueB',
    'literal',
    'env',
    'darwin',
    'VS2015',
    'theme',
    'vimMode',
    'model',
    'type',
    'label',
    'category',
    'default',
    'tree',
    'flat',
    'N/A',
    'row',
    'column',
    'info',
    'message',
    'glob',
    'local',
    'add',
    'sync',
    'node',
    'pipe',
    'data',
    'close',
    'path',
    '--- File',
    '--- FILE',
    '--- END FILE',
    'rm -rf',
    'debug',
    'built',
    '{ "active"',
    '"test@',
    'active@',
    'old1@',
    'src',
    'dist',
    'lib',
    '--authfile="',
    '--authfile=<(echo \'{}\')',
    'build',
    '--build-arg CLI_VERSION_ARG=',
    '-f "',
    '" -t "',
    'image prune -f',
    'ignore',
    'npx --yes @vscode/vsce package --no-dependencies',
    'sha256',
    'hex',
    'tmp',
    'otel',
    'bin',
    'json',
    'curl -sL -H "User-Agent',
    'gemini-cli-dev-script" -o "',
    'curl -fL -sS -o "',
    'windows',
    'zip',
    'arm64',
    'unzip -o "',
    '" -d "',
    'tar -xzf "',
    '" -C "',
    'exe',
    'packages/cli/',
    'npm install',
    'npm version',
    '--no-git-tag-version --allow-same-version',
    'npm ls --workspaces --json --depth=0',
    'npm run version <patch|minor|major|prerelease>',
    'scripts/tests/',
    'lcov',
    'scripts/tests/**/*',
    'node scripts/',
    'npmrc',
    'core',
    'add <name> <commandOrUrl> [args',
    'remove <name>',
    'fs/promises',
    'add my-server /path/to/server arg1 arg2 -e FOO=bar',
    'arg1',
    'Set HTTP headers for SSE and HTTP transports (',
    '-H "X-Api-Key',
    'abc123" -H "Authorization',
    'Bearer abc123")',
    '@google/gemini-cli',
    '@google/gemini-cli-core',
    '@modelcontextprotocol/sdk/client/',
    '/Library/Application Support/GeminiCli/',
    '\\ProgramData\\gemini-cli\\',
    'workspace_endpoint_from_env/api',
    'password@host',
    '<ToolStatsDisplay />',
    '# function\ndef fibonacci(n)',
    'a, b = 0, 1\n    for _ in range(n)',
    'a, b = b, a + b\n    return a',
    'python',
    '--- a/',
    '+++ b/',
    '@@ -1,2 +1,2 @@\n- print("Hello, " + name)\n+ print(f"Hello, {name}!")',
    'beta',
    '3+build456',
    'abcdef',
    '---\nContent\n--- End of File',
    'EXDEV',
    'localhost',
    'x64',
    'amd64',
    'packages/vscode-ide-companion/*',
    'bundle',
    'vscode',
    'packages/cli/src/generated/',
    'packages/**/*',
    'not found',
    'packages/cli/src/generated',
    'git rev-parse --short HEAD',
    'utf8',
    'gcp',
    'good',
    '{{args}}',
    'open-telemetry/opentelemetry-collector-releases',
    'DEBUG=true\nDEBUG_MODE=1\nGEMINI_API_KEY=test-key',
    '!{cmd1} and !{cmd2}',
    '--set=',
    'endpoint=localhost',
    'cmd1',
    'cmd2',
    'cmd3',
    'cmd4',
    'cmd5',
    'diff',
    'vsix',
    'rand=',
    'markdown',
    'mcp',
    '!{echo "hello"}, Second',
    '!{rm -rf /}',
    'rm -rf /',
    'tail -f',
    'output1',
    'output2',
    '!{  ls -l  }',
    'ls -l',
    'VSCode',
    'Idle',
    'App UI',
    'gemini/',
    '/mcp desc',
    '/mcp nodesc',
    '/ide status',
    '{title}',
    '{info}',
    '/chat save <tag>',
    '/chat save',
    '/chat resume <tag>',
    '/chat delete <tag>',
    'Parse @',
    '{prop1',
    'value1}',
    '{ ls -l; }; __code=$?; pwd > "',
    '"; exit $__code',
    'got status',
    '400 Bad Request',
    '{"error"',
    '{"code"',
    '"400,"message"',
    '"API key not valid',
    '","status"',
    '"INVALID_ARGUMENT"}}',
    '[API Error',
    '(Status',
    'INVALID_ARGUMENT)]',
    '429,"message"',
    '"Rate limit exceeded","status"',
    '"RESOURCE_EXHAUSTED"}}',
    '[Stream Error',
    '"malformed}',
    '{"not_an_error"',
    '"some other json"}]',
    '(command',
    'npm i -g @google/gemini-cli@',
    '0, stderr',
    'An error occurred)',
    'npm i -g @google/gemini-cli@latest',
    '(error',
    'Spawn error)',
    'npm i -g @google/gemini-cli@nightly',
    '@latest',
    '@nightly',
    ', stderr',
    'cwd',
    'log',
    'bun/install/cache/12345/bin/gemini',
    'brew list -1 | grep -q "^gemini-cli$"',
    'pnpm/global/5/node_modules/',
    'pnpm/some-hash/node_modules/@google/gemini-cli/dist/',
    'pnpm add -g @google/gemini-cli@latest',
    'yarn/global/node_modules/@google/gemini-cli/dist/',
    'yarn global add @google/gemini-cli@latest',
    'bun/bin/gemini',
    'bun add -g @google/gemini-cli@latest',
    'bin/gemini',
    'bun',
    'lockb',
    'until timeout',
    'curl -s',
    'do sleep',
    '; done',
    'pull',
    '{test,spec}',
    '?(c|m)[jt]s?(x)',
    '**/node_modules/**',
    '**/dist/**',
    '**/cypress/**',
    'jsdom',
    'junit',
    'src/**/*',
    'html',
    'cobertura',
    'part 1',
    'part 2',
    'string 1',
    'string 2',
    'models/',
    'parts',
    'test-google-account@',
    '&state=',
    'test-gcp-account@',
    'Bearer gcp-access-token',
    'Bearer',
    'response',
    'request',
    'requestPost',
    'operations/123',
    'projects/test',
    'GET',
    'application/json',
    'POST',
    'sse',
    'stream',
    'paid',
    '{"key"',
    '"value"}',
    '```json',
    '@google/genai',
    ', \'function\\s+myFunction\', \'import\\s+\\{',
    '*\\}\\s+from\\s+',
    'js\', \'*',
    '{ts,tsx}\', \'src/**\')',
    '{filePath}',
    '{ my-command & }; __code=$?; pgrep -g 0 >',
    '}; __code=$?; pwd > "',
    'export PATH="$PATH',
    'export PYTHONPATH="$PYTHONPATH',
    'socat TCP4-LISTEN',
    '2> /dev/null &',
    ',bind=$(hostname -i),fork,reuseaddr TCP4',
    '2>&1; exit $__code;',
    'npm run debug --',
    'npm rebuild && npm run start --',
    'node --inspect-brk=',
    '$(which gemini)',
    '}; __code=$?; pgrep -g 0 >',
    '{"name"',
    '"test","value"',
    '"test","circular"',
    '"[Circular]"}',
    '{\n  "name"',
    '"test",\n  "value"',
    '[Circular]',
    '"test",\n  "circular"',
    '"[Circular]"\n}',
    '[{"id"',
    '1,"parent"',
    '"[Circular]"}]',
    'null',
    '"test"',
    'params',
    'util',
    'platform',
    'javascript',
    'alert(1)',
    'aix',
    'ftp',
    '\'Y2FsYy5leGU=\'))))',
    '\'Brien&test=\'value\'',
    'Start-Process \'',
    '\'\'Brien&test=\'\'value\'\'\'',
    'ShellTool',
    'ShellTool(ls)',
    'ShellTool(ls -l)',
    'ShellTool(rm)',
    'ShellTool(rm -rf /)',
    'ShellTool(git status)',
    'run_shell_command(echo)',
    'run_shell_command(ls)',
    'echo "hello" && ls -l',
    'run_shell_command(rm)',
    'echo "hello" && rm -rf /',
    'echo $(rm -rf /)',
    'echo `rm -rf /`',
    'diff <(ls) <(ls -a)',
    'echo \'$(pwd)\'',
    'git status && ls',
    'git status',
    'git status && git commit',
    'git commit',
    '{maxOutputTokens}',
    '{textToSummarize}',
    'prompt = "The user wants to',
    'correctly processes a command with {{args}}',
    '{{args}}"\ndescription = "Shorthand test"',
    'echo hello}',
    'prompt = "Run !{echo \'hello\'}"',
    '/shell rm -rf /',
    'prompt = "Run !{rm -rf /}"',
    'prompt = "Run !{something}"',
    'echo foo} and user says',
    '/pipeline bar',
    'bar',
    ', --argName="value") or by position',
    '"foo"',
    '="foo"',
    '{{args}}!',
    'arg1 "arg two"',
    '!{git status}',
    '!{git status} in !{pwd}',
    '!{ls -l}, Disallowed',
    '[object Object]',
    'bundle/',
    'StdErr',
    'pkill -f "otelcol-contrib"',
    '--inspect-brk=',
    '--target=',
    'diff --git',
    'git rev-parse --abbrev-ref HEAD',
    'git rev-parse --show-toplevel',
    'HTTPS_PROXY=',
    'https_proxy=',
    'HTTP_PROXY=',
    'http_proxy=',
    'NO_PROXY=',
    'no_proxy=',
    '--network',
    '--env',
    'git tag --list "v*',
    '*" --sort=-v',
    'refname',
    'gh release list --limit 100 --json tagName | jq -r \'[',
    '[] | select(',
    'tagName | contains("nightly"))] |',
    'tagName\'',
    'tagName | (contains("nightly") or contains("preview")) | not)] |',
    'pkill -f "jaeger"',
    'application/gzip',
    'YYYY-MM-DD HH',
    'disable [--scope] <name>',
    'enable [--scope] <name>',
    'install [--source | --path ]',
    'uninstall <name>',
    'update [--all] [name]',
    'gemini mcp add [options] <name> <commandOrUrl> [args',
    'py\', \'docs/*',
    'md\')',
    'git grep failed',
    'grep',
    '--exclude-dir=',
    '--include=',
    'anyOf',
    'allOf',
    'oneOf',
    '/mcp auth',
    'SANDBOX',
    'ENOENT',
    'git ignored',
    'gemini ignored',
    '[\'src/**/*',
    'ts\'], [\'',
    '\', \'docs/\']',
    'log", "temp/"',
    '[in',
    'exec',
    'pgrep',
    '(none)',
    '(root)',
    '(empty)',
    '(none)',
    '/c <command>',
    '/c <command>`',
    'neovim',
    'zed',
    'vscodium',
    'windsurf',
    'cursor',
    'numeric',
    'long',
    'code',
    'codium',
    'nvim',
    'zeditor',
    'MB)',
    '@lydell/node-pty',
    'gitignore',
    'exclude',
    'git/**',
    '**/bower_components/**',
    'svn/**',
    'hg/**',
    'dylib',
    'bz2',
    'rar',
    'png',
    'jpg',
    'jpeg',
    'gif',
    'webp',
    'bmp',
    'vscode/**',
    'idea/**',
    '**/build/**',
    '**/coverage/**',
    '**/__pycache__/**',
    'dummy',
    'mjs',
    'cjs',
    'tsx',
    'java',
    'php',
    'phtml',
    'cpp',
    'cxx',
    'C++',
    'C/C++',
    'hpp',
    'swift',
    'lua',
    'scala',
    'ps1',
    'bat',
    'cmd',
    'sql',
    'htm',
    'css',
    'less',
    'sass',
    'scss',
    'xml',
    'json',
    'yaml',
    'yml',
    'dockerfile',
    'clj',
    'cljs',
    'dart',
    'erl',
    'lisp',
    'rkt',
    'groovy',
    'tex',
    'ino',
    'asm',
    'toml',
    'vue',
    'svelte',
    'gohtml',
    'hbs',
    'ejs',
    'erb',
    'jsp',
    'dockerignore',
    'gitignore',
    'npmignore',
    'editorconfig',
    'prettierrc',
    'eslintrc',
    'babelrc',
    'tsconfig',
    'flow',
    'graphql',
    'proto',
    '{instruction}',
    '{old_string}',
    '{new_string}',
    '{error}',
    '{current_content}',
    'chcp',
    'cp437',
    'cp850',
    'cp852',
    'cp866',
    'gb2312',
    'big5',
    'LC_ALL',
    'LC_CTYPE',
    'LANG',
    'command',
    'src/',
    'dist/',
    'silent',
    'url',
    'file',
    'general',
    'ide/diffClosed',
    'ide/diffAccepted',
    'gemini.diff.isVisible',
    'setContext',
    'vscode.diff',
    'openDiff',
    'closeDiff',
    'inherit',
    'npm run generate',
    'npm run build --workspaces',
    'tsc --build',
    'packing @google/gemini-cli',
    'google-gemini-cli-*',
    'npm pack -w @google/gemini-cli --pack-destination',
    'packing @google/gemini-cli-core',
    'google-gemini-cli-core-*',
    'npm pack -w @google/gemini-cli-core --pack-destination',
    'packages/core/src/generated',
    'jaeger',
    'jaegertracing/jaeger',
    'promptInteractive',
    '```sh',
    'tasks/',
    '```markdown',
    '1em',
    '[99;5u',
    '&>/dev/null || useradd -o -u',
    '&& node scripts/',
    '&lt;',
    '&gt;',
    '\[(\d+)(;(\d+))?([u~])$',
    '" --install-extension google',
    'gemini-cli-vscode-ide-companion --force',
    '$p = Get-CimInstance Win32_Process',
    'if ($p) {',
    '@{Name=$',
    ';ParentProcessId=$p',
    'ParentProcessId;CommandLine=$p',
    'CommandLine}',
    '| ConvertTo-Json',
    'powershell "',
    '[user]\n  name = Gemini CLI\n  email = gemini-cli@',
    '[commit]\n  gpgsign = false',
    'GEMINI_API_KEY, GOOGLE_GENAI_USE_VERTEXAI, GOOGLE_GENAI_USE_GCA',
    '@opentelemetry/api',
    '@opentelemetry/semantic-conventions',
    '@src/',
    '\\[(\\d+)(;(\\d+))?([u~])$',
    '^gemini-ide-server-',
    '-\\d+\\',
    'json$',
    '}; __code=$?; pwd >',
    '; exit $__code',
    'gemini-dispatch/',
    'gemini-assistant/',
    'issue-triage/',
    'pr-review/',
    'gha-creds-*',
    '«class PNGf»|TIFF picture|JPEG picture|GIF picture|«class JPEG»|«class TIFF»',
    '&& echo',
    '|| echo',
    'no sandbox',
    'sandbox-exec (',
    '\'q\'',
    '@@ -1,2 +1,2 @@\n- print(',
    'Hello,',
    '+ name)\n+ print(f',
    'Hello, {name}!'
  ]
};

// 파싱/스캔 설정
const ALLOWED_EXTENSIONS: string[] = ['.rs'];

// 파싱/스캔 설정
const IGNORED_CODE_PATTERNS: RegExp[] = [
  /^#[0-9A-Fa-f]{3,8}$/, // hex 색상 코드 (#RGB, #RRGGBB, #RRGGBBAA 등)
  /^\d+$/, // 숫자로만 구성된 문자열 (정수)
  /^[^a-zA-Z]*$/, // 영어 알파벳이 전혀 포함되지 않은 문자열
  /^[a-zA-Z0-9]*[-_][a-zA-Z0-9_-]*$/, // 언더스코어나 하이픈으로 연결된 식별자 (run_shell_command, file-system 등)
  /^\$\S+$/, // $로 시작하고 띄어쓰기가 없는 문자열 ($variable, $HOME 등)
  /\\u001b\[[0-9;]*[A-Za-z]|\\x1b\[[0-9;]*[A-Za-z]|\x1b\[[0-9;]*[A-Za-z]|\u001b\[[0-9;]*[A-Za-z]/, // ANSI 이스케이프 시퀀스 (색상, 커서 이동 등 모든 명령어)
  /^\\u001b|^\u001b/, // \u001b로 시작하는 모든 ANSI 이스케이프 시퀀스
  /^<[a-zA-Z]+[^>]*>$/, // HTML 시작 태그만으로 이루어진 문자열 (<div>, <span class="..."> 등)
  /^<\/[a-zA-Z]+>$/, // HTML 종료 태그만으로 이루어진 문자열 (</div>, </span> 등)
  /^<[a-zA-Z]+[^>]*\/>$/, // HTML 자체 닫힘 태그만으로 이루어진 문자열 (<br/>, <img src="..."/> 등)
  /^(pnpm|npm|yarn|bun|curl|git|ps|run|osascript|network)\s+/, // 명령어로 시작하는 패턴 (pnpm add, npm i, yarn global, bun add, curl -s, git remote, ps -o, run 등)
  /^(pnpm|npm|yarn|bun|curl|git|ps|run|osascript|network)$/, // 명령어 자체만으로 이루어진 문자열
  /\b(pnpm|npm|yarn|bun)\s+(add|install|i|global|run|build|version)\b/, // 패키지 매니저 명령어 패턴
  /\bcurl\s+(-[a-zA-Z]+\s*)+/, // curl 옵션이 포함된 패턴
  /\bgit\s+(remote|rev-parse|status|commit|pull|push|add|clone|grep)\b/, // git 서브명령어 패턴
  /^(npm|yarn|pnpm|bun)\s+(add|install|i)\s+-g\s+@/, // 전역 설치 명령어 패턴
  /--[a-zA-Z-]+=[^"\s]*/, // 명령줄 옵션 패턴 (--option=value)
  /^-[a-zA-Z]+\s/, // 짧은 옵션 패턴 (-v, -h 등)
  /^run `/, // run ` 으로 시작하는 패턴
  /^\w+\s+(-[a-zA-Z-]+\s*)+/, // 명령어 + 옵션들 패턴
  /^--[a-zA-Z-]+\s+[a-zA-Z0-9._/-]+$/, // 긴 옵션과 값 패턴 (--user root, --output file.txt 등)
  /^-[a-zA-Z]+\s+[a-zA-Z0-9._/-]+$/, // 짧은 옵션과 값 패턴 (-g google, -u user 등)
  /^--[a-zA-Z-]+$/, // 긴 옵션만 있는 패턴 (--help, --version 등)
  /^-[a-zA-Z]+$/, // 짧은 옵션만 있는 패턴 (-h, -v 등)
  /^[A-Z_][A-Z0-9_]*=.*$/, // 환경 변수 설정 패턴 (ID=debian, TARGET_DIR=, NODE_OPTIONS= 등)
  /^[A-Z_][A-Z0-9_]*=$/, // 빈 값 환경 변수 설정 패턴 (TARGET_DIR=, TMP_DIR= 등)
  /^%[A-Za-z0-9_]+%$/, // Windows 환경 변수 패턴 (%userprofile%, %PATH%, %TEMP% 등)
  /^[a-zA-Z0-9_-]+\+[a-zA-Z0-9_+-]+$/, // + 연결 패턴 (shift+enter, ctrl+enter, github+json 등)
  /^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._/-]+$/, // 경로 패턴 (gemini-cli/packages/, application/vnd, npm/_npx 등)
  /^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+\/[a-zA-Z0-9._/-]*$/, // 더 긴 경로 패턴 (pnpm/global/5, bun/install/cache 등)
  /^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+\/[a-zA-Z0-9._/-]*$/, // 3단계 이상 경로 패턴
  /^[a-zA-Z0-9._-]+\/_[a-zA-Z0-9._-]+$/, // 언더스코어가 포함된 경로 패턴 (npm/_npx, pnpm/_pnpx 등)
  /^\\\[/, // \\[ 로 시작하는 정규식 패턴 제외
  /^export\s+[A-Z_][A-Z0-9_]*=/, // 'export PATH=' 같은 환경 변수 설정 제외
  /^(?:[A-Za-z]:)?(?:\\|\/|\\\\).*/, // Windows 또는 Unix 스타일의 절대 경로
]; // /^\/\//, // 주석으로 시작하는 경우 /\//, // 경로 구분자를 포함하는 경우
const URL_REGEX = /(https?:\/\/[^\s"'`]+)/g;

// URI(경로/쿼리) 형태 문자열 판별: 시작이 '/' 이고 공백 없으며 쿼리(?) 또는 추가 '/' 포함 가능
// 예: /oauth/callback?code=... , /api/v1/users , /path/file?id=1&x=y
const URI_LIKE_REGEX = /^\/[A-Za-z0-9._~!$&'()*+,;=:@%\-/]*?(?:\?[A-Za-z0-9._~!$&'()*+,;=:@%\-/=&]*)?$/;

// 네이밍 컨벤션 패턴들 (초기 제외용)
const NAMING_CONVENTION_PATTERNS: RegExp[] = [
  /^[a-z][a-zA-Z0-9]*$/, // camelCase: 첫 단어는 소문자, 이후 단어는 대문자로 시작
  /^[A-Z][a-zA-Z0-9]*$/, // PascalCase: 모든 단어의 첫 글자를 대문자로 시작
  /^[a-z0-9]+(_[a-z0-9]+)+$/, // snake_case: 모든 단어를 소문자 + _ 로 연결
  /^[a-z0-9]+(-[a-z0-9]+)+$/, // kebab-case: 모든 단어를 소문자 + - 로 연결
  /^[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)+$/ // dot notation: 단어와 단어가 .으로 연결
];

// (추가) 확장자 길이 <=4 인 파일명 패턴 (예: index.ts, main.jsx, app.mjs 등)
// 이 패턴에 매칭되는 파일명은 후보 토큰에서 제외하고, 앞/뒤 문자열을 분리하여 처리한다.
function extractSegmentsExcludingFilenames(str: string): string[] {
  if (!str) return [];
  
  // 네이밍 컨벤션 패턴 체크 - 전체 문자열이 네이밍 컨벤션에 해당하면 제외
  if (NAMING_CONVENTION_PATTERNS.some(pattern => pattern.test(str))) {
    return [];
  }
  
  const segments: string[] = [];
  let lastIndex = 0;
  const fileRegex = /[A-Za-z0-9_\-]+\.[A-Za-z0-9]{1,4}(?=[^A-Za-z0-9_]|$)/g;
  let match: RegExpExecArray | null;
  while ((match = fileRegex.exec(str)) !== null) {
    const pre = str.slice(lastIndex, match.index);
    if (pre) segments.push(pre);
    // 파일명 자체(match[0])는 버림
    lastIndex = fileRegex.lastIndex;
  }
  const tail = str.slice(lastIndex);
  if (tail) segments.push(tail);
  // 이제 segments 각각을 기존 분할 규칙(/[:."]| \${.*?}/)으로 다시 잘라 토큰화
  // 분할 헬퍼: ':', '.', '"' 또는 '${}' 기준으로 분할 후 트림/필터링
  return segments
    .flatMap(s => s.split(/[:."]|\${.*?}/))
    .map(p => p.trim())
    .filter(Boolean)
    .filter(token => !NAMING_CONVENTION_PATTERNS.some(pattern => pattern.test(token))); // 분할된 토큰들도 네이밍 컨벤션 체크
}

// 테스트 파일 패턴 검사 함수
function isTestFile(filename: string): boolean {
  const testPatterns = [
    /\.test\.ts$/,
    /\.test\.tsx$/,
    /\.test\.js$/,
    /\.test\.jsx$/,
    /\.test\.circular\.ts$/,
    /\.test\.circular\.tsx$/,
    /\.test\.circular\.js$/,
    /\.test\.circular\.jsx$/
  ];
  return testPatterns.some(pattern => pattern.test(filename));
}

// 파일 수집
function getAllFiles(dirPath: string, baseDir: string, acc: string[] = []): string[] {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const relFromBase = path.relative(baseDir, fullPath).replace(/\\/g, '/');

    // 특정 파일/폴더 제외
    if (EXCLUDED_ITEMS.PATHS.some((p: string) => relFromBase.startsWith(p))) {
      continue;
    }

    // 제외 디렉터리 필터
    if (entry.isDirectory()) {
      const dirName = path.basename(fullPath);
      if (EXCLUDED_ITEMS.DIRS.includes(dirName)) continue;
      getAllFiles(fullPath, baseDir, acc);
    } else {
      const ext = path.extname(entry.name);
      if (!ALLOWED_EXTENSIONS.includes(ext)) continue;
      if (EXCLUDED_ITEMS.BASENAMES.includes(entry.name)) continue;
      
      // 테스트 파일 제외
      if (isTestFile(entry.name)) continue;
      
      acc.push(fullPath);
    }
  }
  return acc;
}

// ============================================================
// Rust(.rs) 전용 문자열 추출 파서
// ============================================================
function extractStringsFromRustFile(filePath: string, projectRoot: string): { 'RELATIVE-PATH': string; LINE: number; VALUE: string }[] {
  const code = fs.readFileSync(filePath, 'utf-8');
  const results: { 'RELATIVE-PATH': string; LINE: number; VALUE: string }[] = [];
  const relPath = '' + path.relative(path.join(projectRoot, SCAN_ROOT_DIR), filePath).replace(/\\/g, '/');

  // 주석과 문자열을 구분하기 위한 간단한 토크나이저
  // '//' 또는 '/*' 는 주석, '"' 또는 'r#' 로 시작하는 것은 문자열 시작
  let i = 0;
  const len = code.length;

  while (i < len) {
    // 행 단위 위치 추적
    const lineStart = i - code.substring(0, i).lastIndexOf('\n');
    const lineNum = code.substring(0, i).split('\n').length;

    // 주석 처리: // (행 주석)
    if (code[i] === '/' && code[i + 1] === '/') {
      // 행 주석: 다음 줄바꿈까지 건너뜀
      const nextNewLine = code.indexOf('\n', i);
      if (nextNewLine === -1) break;
      i = nextNewLine + 1;
      continue;
    }

    // 주석 처리: /* */ (블록 주석)
    if (code[i] === '/' && code[i + 1] === '*') {
      const endBlock = code.indexOf('*/', i + 2);
      if (endBlock === -1) break;
      i = endBlock + 2;
      continue;
    }

    // 문서 주석: /// 또는 //!
    if (code[i] === '/' && (code[i + 1] === '/' || code[i + 1] === '*') && (code[i + 2] === '/' || code[i + 2] === '!')) {
      if (code[i + 1] === '/') {
        // /// 또는 //!
        const nextNewLine = code.indexOf('\n', i);
        if (nextNewLine === -1) break;
        i = nextNewLine + 1;
      } else {
        // /** */ 문서 블록 주석
        const endBlock = code.indexOf('*/', i + 2);
        if (endBlock === -1) break;
        i = endBlock + 2;
      }
      continue;
    }

    // 문자열 추출
    if (code[i] === '"') {
      const stringResult = parseRustString(code, i, len);
      if (stringResult) {
        const { endIndex, value, lineNumber } = stringResult;
        // 이스케이프 처리: 실제 문자열 값 복원
        const unescapedValue = unescapeRustString(value);
        // 필터링 검사
        if (unescapedValue.length >= MIN_STRING_KEY_LENGTH &&
            unescapedValue.length <= MAX_STRING_KEY_LENGTH &&
            !EXCLUDED_ITEMS.STRINGS.includes(unescapedValue)) {
          results.push({
            'RELATIVE-PATH': relPath,
            LINE: lineNumber,
            VALUE: unescapedValue,
          });
        }
        i = endIndex;
      } else {
        i++;
      }
      continue;
    }

    i++;
  }

  return results;
}

/**
 * Rust 문자열 리터럴 파싱
 * "..."       - 일반 문자열
 * r"..."      - raw 문자열
 * r#"..."#    - delim으로 구분된 raw 문자열
 * b"..."      - 바이트 문자열
 */
function parseRustString(code: string, startIdx: number, len: number): { endIndex: number; value: string; lineNumber: number } | null {
  if (code[startIdx] !== '"') return null;

  //.raw 문자열 확인: r 또는 b 또는 br 또는 rb 접두사
  let prefix = '';
  let i = startIdx;
  while (i > 0 && /[br]/.test(code[i - 1]) && isRustIdentChar(code[i - 2]) === false) {
    // 실제 접두사 판별은 어렵지만, 간단히 r 또는 b로 시작하는지 확인
    break;
  }
  // 접두사 분석
  // 코드 역방향으로 확인
  let prefixIdx = startIdx - 1;
  while (prefixIdx >= 0 && (code[prefixIdx] === 'r' || code[prefixIdx] === 'b' || code[prefixIdx] === '"')) {
    prefixIdx--;
  }
  // prefixIdx는 문자열 접두사 바로 전 위치
  // 실제로는 간단히 처리: startIdx 앞 문자가 r 또는 b 인지 확인
  const charBefore = startIdx > 0 ? code[startIdx - 1] : '';
  if (charBefore === 'r' || charBefore === 'b' || charBefore === 'R' || charBefore === 'B') {
    prefix = charBefore;
    // br 또는 rb 인 경우 둘 다 포함
    if ((charBefore === 'r' || charBefore === 'R') && startIdx > 1 && (code[startIdx - 2] === 'b' || code[startIdx - 2] === 'B')) {
      prefix = 'br';
    } else if ((charBefore === 'b' || charBefore === 'B') && startIdx > 1 && (code[startIdx - 2] === 'r' || code[startIdx - 2] === 'R')) {
      prefix = 'br';
    }
  }

  let actualStringStart = startIdx;
  let delimiter = '"';
  let hashCount = 0;

  if (prefix) {
    // raw 문자열: r#"..."#
    actualStringStart = startIdx; // prefix 바로 뒤가 "
    // 하지만 raw 문자열은 r" 이 아니라 r#" 으로 시작할 수도 있음.
    // 일반적인 경우: r"..." 또는 br"..."
    // r#"..."#: 따옴표 앞에 # 기호가 여러 개 있을 수 있음

    // startIdx 위치에서 " 확인 후, 바로 다음 문자들 확인
    // r"..." 패턴: " 다음 바로 문자열 내용 시작
    // r#"..."# 패턴: " 앞에 #가 여러 개 있고, 닫힌 " 뒤 에도 같은 수의 #

    // 실제로는 startIdx가 항상 " 이므로,
    // r"..." 과 r#"..."# 를 구분해야 함
    // r"..." 의 경우: 따옴표 바로 다음 문자부터 문자열 내용
    // r#"..."# 의 경우: 따옴표 앞의 # 수를 세어야 함

    // 단, 여기서 startIdx 는 이미 " 위치이므로
    // raw 문자열의 경우 " 앞에 #가 여러 개 있었는지 확인해야 함

    // 간단한 접근: startIdx 앞의 # 개수를 센다
    let hashIdx = startIdx - 1;
    while (hashIdx >= 0 && code[hashIdx] === '#') {
      hashCount++;
      hashIdx--;
    }

    // prefix의 일부가 아닌 # 확인 (prefix = r 이고 앞에 r#이 있는 경우)
    // 사실 prefix는 이미 r 또는 br로 설정했으므로, hashCount는 prefix와 별도

    // 실제로는 단순 처리: raw 문자열인 경우 # delim 사용
    // 일반 Rust r"..." 에서도 # 없이 " 바로 뒤에 문자열 시작 가능
    // r#"..."# 패턴에서만 # delim 사용

    if (hashCount > 0) {
      // r#"..."# 또는 br#"..."# 패턴: delim은 hashCount 개의 #
      // 닫는 쪽: " + 같은 수의 #
      delimiter = '"' + '𝐇' // 임시 마커
      // 실제 처리에서는 닫는 부분을 찾음
    }
  }

  // 간단한 Rust 문자열 파서 (일반 문자열 + raw 문자열)
  let result = simpleParseRustString(code, startIdx, len);
  return result;
}

/**
 * Rust 문자열을 단순 파싱
 * - 일반 문자열: " ... "
 * - raw 문자열: r" ... " 또는 r#" ... "# (n >= 0)
 * - 바이트 문자열: b" ... " (일반 문자열과 동일, 이스케이프 처리만 다름)
 */
function simpleParseRustString(code: string, startIdx: number, len: number): { endIndex: number; value: string; lineNumber: number } | null {
  if (code[startIdx] !== '"') return null;

  let i = startIdx;
  let lineNumber = code.substring(0, i).split('\n').length;

  // 접두사 확인: raw 문자열인지
  let isRaw = false;
  let rawDelimiter: string | null = null; // 닫는 구분자 (" + ##)

  // startIdx 이전 문자 확인
  let prefixEnd = startIdx;
  // r 또는 b 또는 br 또는 rb 접두사인지 확인
  if (startIdx >= 1 && /[rRbB]/.test(code[startIdx - 1])) {
    let prefix = '';
    let pIdx = startIdx - 1;

    // br 또는 rb 인지 확인
    if (pIdx >= 1 && /[rRbB]/.test(code[pIdx - 1]) && code[pIdx] !== code[pIdx - 1]) {
      prefix = code[pIdx - 1].toLowerCase() + code[pIdx].toLowerCase();
      pIdx--;
    } else if (pIdx >= 0) {
      prefix = code[pIdx].toLowerCase();
    }

    if (prefix === 'r' || prefix === 'b' || prefix === 'br' || prefix === 'rb') {
      isRaw = (prefix === 'r' || prefix === 'br' || prefix === 'rb');

      if (isRaw) {
        // raw 문자열: 시작 " 앞의 # 수 세기
        let hashCount = 0;
        let hIdx = pIdx - 1; // prefix 바로 전
        if (prefix.length === 1) {
          // prefix가 1자리 (r)
          if (pIdx >= 1 && code[pIdx - 1] === '#') {
            let hc = 0;
            let ti = pIdx - 1;
            while (ti >= 0 && code[ti] === '#') {
              hc++;
              ti--;
            }
            hashCount = hc;
          }
        } else {
          // prefix가 2자리 (br, rb)
          if (pIdx >= 1 && code[pIdx - 1] === '#') {
            let hc = 0;
            let ti = pIdx - 1;
            while (ti >= 0 && code[ti] === '#') {
              hc++;
              ti--;
            }
            hashCount = hc;
          }
        }

        if (hashCount > 0) {
          rawDelimiter = '"' + '#'.repeat(hashCount);
        } else {
          rawDelimiter = null; // # 없는 raw 문자열: r"..."
        }
      }

      prefixEnd = pIdx;
    }
  }

  // 문자열 시작: startIdx 가 "
  i = startIdx + 1;
  let value = '';

  if (isRaw && rawDelimiter) {
    // r#"..."# 패턴: 닫는 구분자를 찾을 때까지 스캔
    const closePattern = '"' + '#'.repeat(rawDelimiter.length - 1);
    while (i < len) {
      // 줄바꿈 위치를{lineNumber} 업데이트
      if (code[i] === '\n') lineNumber++;

      // 닫는 패턴 발견?
      if (code.substring(i, i + closePattern.length) === closePattern) {
        // raw 문자열 종료: delimiters 사이의 내용을 그대로 가져옴
        value = code.substring(startIdx + 1, i);
        return { endIndex: i + closePattern.length, value, lineNumber };
      }
      i++;
    }
    // 닫는 구분자 못 찾음
    return { endIndex: len, value: code.substring(startIdx + 1), lineNumber };
  } else if (isRaw) {
    // r"..." (또는 br"...", rb"...") 패턴: # 없이 " 만으로 종료
    while (i < len) {
      if (code[i] === '\n') lineNumber++;
      if (code[i] === '"') {
        // 닫는 " 발견. 단, "" (escaped quote in raw string)인지 확인
        // Rust raw 문자열에서 ""는 리터럴 "를 의미 (escape 아님)
        // r"foo""bar" -> foo"bar
        // 하지만 일반적으로 raw 문자열 안에서는 ""를 이스케이프로 처리하지 않음
        // Rust spec: raw string 에서 "는 이스케이프 불가, ""로 "를 표현
        // 그런데 일반적인 raw 문자열에서는 ""를 사용할 일이 거의 없음
        // 여기서는 간단히 "로 종료

        // 하지만 "" 연속인 경우 처리
        if (i + 1 < len && code[i + 1] === '"') {
          // "" 은 이스케이프된 " 문자
          value += '"';
          i += 2;
        } else {
          // 실제 종료
          value = code.substring(startIdx + 1, i);
          return { endIndex: i + 1, value, lineNumber };
        }
      } else {
        value += code[i];
        i++;
      }
    }
    return { endIndex: len, value, lineNumber };
  } else {
    // 일반 문자열 (또는 바이트 문자열)
    // 이스케이프 시퀀스 처리
    while (i < len) {
      if (code[i] === '\n') lineNumber++;

      if (code[i] === '\\') {
        // 이스케이프 시퀀스
        i++;
        if (i >= len) break;

        switch (code[i]) {
          case '"': value += '"'; i++; break;
          case '\\': value += '\\'; i++; break;
          case '/': value += '/'; i++; break;
          case 'b': value += '\b'; i++; break;
          case 'f': value += '\f'; i++; break;
          case 'n': value += '\n'; i++; break;
          case 'r': value += '\r'; i++; break;
          case 't': value += '\t'; i++; break;
          case 'u': {
            // Unicode escape: \u{XXXX} 또는 \uXXXX
            if (i + 1 < len && code[i + 1] === '{') {
              // \u{XXXX} 형식
              let uStart = i + 2;
              let uEnd = uStart;
              while (uEnd < len && code[uEnd] !== '}') uEnd++;
              const hex = code.substring(uStart, uEnd);
              const codePoint = parseInt(hex, 16);
              if (!isNaN(codePoint)) {
                value += String.fromCodePoint(codePoint);
              }
              i = uEnd + 1;
            } else {
              // \uXXXX 형식 (4자리 16진수)
              const hex4 = code.substring(i + 1, i + 5);
              if (/^[0-9a-fA-F]{4}$/.test(hex4)) {
                const codePoint = parseInt(hex4, 16);
                value += String.fromCodePoint(codePoint);
                i += 5;
              } else {
                value += '\\u';
                i++;
              }
            }
            break;
          }
          case 'x': {
            // Hex escape: \xXX
            if (i + 2 < len) {
              const hex2 = code.substring(i + 1, i + 3);
              if (/^[0-9a-fA-F]{2}$/.test(hex2)) {
                const byte = parseInt(hex2, 16);
                value += String.fromCharCode(byte);
                i += 3;
              } else {
                value += '\\x';
                i++;
              }
            } else {
              value += '\\x';
              i++;
            }
            break;
          }
          case '0': {
            // Null character: \0 (단, \0 뒤에 숫자가 오면 8진수 주의)
            if (i + 1 < len && /[0-7]/.test(code[i + 1])) {
              // 8진수 이스케이프: \0 -> \00 (1자리)
              let oct = '0';
              i++;
              let octIdx = i;
              while (octIdx < len && octIdx - i < 2 && /[0-7]/.test(code[octIdx])) {
                oct += code[octIdx];
                octIdx++;
              }
              const octVal = parseInt(oct, 8);
              value += String.fromCharCode(octVal);
              i = octIdx;
            } else {
              value += '\0';
              i++;
            }
            break;
          }
          default:
            // 알 수 없는 이스케이프: 그대로 추가
            value += code[i];
            i++;
        }
      } else if (code[i] === '"') {
        // 문자열 종료
        return { endIndex: i + 1, value, lineNumber };
      } else {
        value += code[i];
        i++;
      }
    }
    return { endIndex: len, value, lineNumber };
  }
}

function unescapeRustString(value: string): string {
  // Rust 일반 문자열에서 \\n, \\t 등을 실제 문자로 변환
  // simpleParseRustString에서 이미 이스케이프 처리했으므로 여기서는 추가 처리 불필요
  // 단, raw 문자열의 경우 이스케이프가 없으므로 그대로 반환
  return value;
}

/**
 * 문자가 식별자 문자인지 확인 (simple identifier check)
 */
function isRustIdentChar(ch: string): boolean {
  return /[a-zA-Z0-9_]/.test(ch);
}

// ============================================================
// TypeScript/JS 문자열 추출 (Babel 파서 사용)
// ============================================================
function extractStringsFromTsFile(filePath: string, projectRoot: string) {
  const code = fs.readFileSync(filePath, 'utf-8');

  let ast: any;
  try {
    ast = parser.parse(code, {
      sourceType: 'unambiguous',
      plugins: ['typescript', 'jsx'],
      errorRecovery: true,
      ranges: false,
      tokens: false,
      allowReturnOutsideFunction: true,
    } as any);
  } catch (e) {
    console.warn(`[parse-skip] ${filePath}: ${(e as Error).message}`);
    return [] as { 'RELATIVE-PATH': string; LINE: number; VALUE: string }[];
  }

  const results: { 'RELATIVE-PATH': string; LINE: number; VALUE: string }[] = [];
  // sample/gemini-cli 경로를 제거하고 상대 경로 계산
  const relPath = '' + path.relative(path.join(projectRoot, SCAN_ROOT_DIR), filePath).replace(/\\/g, '/');

  try {
    traverse(ast, {
    StringLiteral(p) {
      // import 선언 내 문자열은 제외
      if (p.parentPath && p.parentPath.node.type === 'ImportDeclaration') return;
      const val = p.node.value;
      if (!val) return;
      if (val.length > MAX_STRING_KEY_LENGTH) return;
      if (EXCLUDED_ITEMS.STRINGS.includes(val)) return;
      const line = p.node.loc?.start.line ?? 0;
      results.push({ 'RELATIVE-PATH': relPath, LINE: line, VALUE: val });
    },
    TemplateLiteral(p) {
      // 템플릿 리터럴의 고정 문자열(quasis)만 결합하여 수집
      const text = p.node.quasis.map(q => q.value.cooked ?? q.value.raw ?? '').join('${}');
      const trimmed = (text || '').trim();
      if (!trimmed) return;
      if (trimmed.length > MAX_STRING_KEY_LENGTH) return;
      if (EXCLUDED_ITEMS.STRINGS.includes(trimmed)) return;
      const line = p.node.loc?.start.line ?? 0;
      results.push({ 'RELATIVE-PATH': relPath, LINE: line, VALUE: trimmed });
    },
    JSXText(p) {
      const text = p.node.value.trim();
      if (!text) return;
      if (text.length > MAX_STRING_KEY_LENGTH) return;
      if (EXCLUDED_ITEMS.STRINGS.includes(text)) return;
      const line = p.node.loc?.start.line ?? 0;
      results.push({ 'RELATIVE-PATH': relPath, LINE: line, VALUE: text });
    },
  });
  } catch (e) {
    console.warn(`[traverse-skip] ${filePath}: ${(e as Error).message}`);
  }

  return results;
}

// ============================================================
// 통합 문자열 추출 (확장자별 라우팅)
// ============================================================
function extractStringsFromFile(filePath: string, projectRoot: string): { 'RELATIVE-PATH': string; LINE: number; VALUE: string }[] {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.rs') {
    return extractStringsFromRustFile(filePath, projectRoot);
  } else {
    return extractStringsFromTsFile(filePath, projectRoot);
  }
}

function main() {
  try {
    const projectRoot = path.join(__dirname, '..');
    const sampleRoot = path.join(projectRoot, SCAN_ROOT_DIR);

    if (!fs.existsSync(sampleRoot)) {
      console.error(`Not found: ${sampleRoot}`);
      process.exit(1);
    }

    const files = getAllFiles(sampleRoot, sampleRoot);
    files.sort();

    const allEntries: { 'RELATIVE-PATH': string; LINE: number; VALUE: string }[] = [];
    for (const f of files) {
      const relPath = '' + path.relative(path.join(projectRoot, SCAN_ROOT_DIR), f).replace(/\\/g, '/');
      // EXCLUDED_ITEMS.PATHS에 포함된 파일은 건너뛰기
      if (EXCLUDED_ITEMS.PATHS.some((p: string) => relPath.includes(p))) continue;
      const entries = extractStringsFromFile(f, projectRoot);
      if (entries.length) allEntries.push(...entries);
    }

    const ignoreInfo: {
      PATHS: string[];
      DIRS: string[];
      BASENAMES: string[];
      STRINGS: string[];
      CODES: ({ 'RELATIVE-PATH': string; } & { [key: string]: string[] | string })[];
    } = {
      PATHS: EXCLUDED_ITEMS.PATHS,
      DIRS: EXCLUDED_ITEMS.DIRS,
      BASENAMES: EXCLUDED_ITEMS.BASENAMES,
      STRINGS: [],// EXCLUDED_ITEMS.STRINGS,
      CODES: [],
    };
    const perFile: { [relPath: string]: { [key: string]: any } } = {};

    for (const ent of allEntries) {
      const fileObj = perFile[ent['RELATIVE-PATH']] || { 'RELATIVE-PATH': ent['RELATIVE-PATH'] };
      const lineKey = `LINE-${ent.LINE}`;
      if (!fileObj[lineKey]) fileObj[lineKey] = { 'IGNORE-KEYS': [], 'USED-KEYS': [], 'TRANSLATED-KEYS': [] };

      const parts = ent.VALUE.split(URL_REGEX);

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (!part) continue;

        if (i % 2 !== 1) { // URL 이 아닌 일반 문자열 영역
          // (변경) 파일명(확장자 <=4) 제거 후 앞/뒤를 분리하여 토큰화
          const candidates = extractSegmentsExcludingFilenames(part);
          for (const candidate of candidates) {
            // URI 형태는 제외
            if (URI_LIKE_REGEX.test(candidate)) continue;
            const isIgnored = candidate.length <= MIN_STRING_KEY_LENGTH ||
                              candidate.length > MAX_STRING_KEY_LENGTH ||
                              EXCLUDED_ITEMS.STRINGS.includes(candidate) ||
                              IGNORED_CODE_PATTERNS.some(p => p.test(candidate));

            if (!isIgnored) {
              fileObj[lineKey][candidate] = candidate;
              // USED-KEYS 배열에 사용되는 키 추가
              if (!fileObj[lineKey]['USED-KEYS'].includes(candidate)) {
                fileObj[lineKey]['USED-KEYS'].push(candidate);
              }
            }
          }
        }
      }
      
      perFile[ent['RELATIVE-PATH']] = fileObj;
    }

    // 빈 라인들을 정리하고 유효하지 않은 파일들을 제거
    Object.keys(perFile).forEach(relPath => {
      const fileObj = perFile[relPath];
      
      // 각 라인에서 유효한 키가 있는지 확인하고 빈 라인들을 제거
      Object.keys(fileObj).forEach(lineKey => {
        if (lineKey.startsWith('LINE-')) {
          const lineData = fileObj[lineKey];
          const hasValidKeys = lineData['USED-KEYS'] && lineData['USED-KEYS'].length > 0;
          const hasTranslatedKeys = lineData['TRANSLATED-KEYS'] && lineData['TRANSLATED-KEYS'].length > 0;
          const hasOtherKeys = Object.keys(lineData).some(key => 
            !['IGNORE-KEYS', 'USED-KEYS', 'TRANSLATED-KEYS'].includes(key)
          );
          
          // 유효한 키가 없으면 해당 라인을 삭제
          if (!hasValidKeys && !hasTranslatedKeys && !hasOtherKeys) {
            delete fileObj[lineKey];
          }
        }
      });
      
      // RELATIVE-PATH 외에 유효한 라인이 없으면 파일 자체를 삭제
      const validLines = Object.keys(fileObj).filter(key => key !== 'RELATIVE-PATH');
      if (validLines.length === 0) {
        delete perFile[relPath];
      }
    });

    // ID 맵 구성 (파일별 ID 할당)
    const idMap: { [id: string]: any } = {};
    const relPathsSorted = Object.keys(perFile).sort();
    relPathsSorted.forEach((relPath, idx) => {
      // perFile에 이미 유효한 파일들만 남아있으므로 추가 검증 불필요
      const baseIdNum = parseInt(FILE_ID_START_NUM.toString(), 10) + idx + 1;
      const id = `FILE-${baseIdNum}`;
      idMap[id] = perFile[relPath];
    });

    const outputJson = {
      [DESCRIPTION_KEY]: DESCRIPTION_VALUE,
      [CODE_ROOT_KEY]: {
        [COMMIT_ID_KEY]: {
          TRANSLATOR: [TRANSLATOR_VALUES],
          IGNORE: ignoreInfo,
          ...idMap,
        },
      },
    };

    // 출력 폴더 생성
    const outputDirPath = path.join(__dirname, OUTPUT_DIR);
    if (!fs.existsSync(outputDirPath)) {
      fs.mkdirSync(outputDirPath, { recursive: true });
    }

    LANGUAGES.forEach(lang => {
      const outputFilename = `${COMMIT_ID_KEY}.${lang}.json`;
      const outputPath = path.join(outputDirPath, outputFilename);
      fs.writeFileSync(outputPath, JSON.stringify(outputJson, null, 2));
      console.log(`Successfully created ${outputPath}`);
    });
  } catch (error) {
    console.error('Error creating strings JSON:', error);
    process.exit(1);
  }
}

main();

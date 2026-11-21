(() => {
  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

  // node_modules/@openchamber/sdk/dist/api-version.js
  var OPENCHAMBER_SDK_CHANNEL = "openchamber.sdk";
  var OPENCHAMBER_SDK_API_VERSION = 1;

  // node_modules/@openchamber/sdk/dist/scrollbar-style.js
  var GUEST_SCROLLING_ATTRIBUTE = "data-oc-scrolling";
  var GUEST_SCROLLBAR_CSS = `
:root {
  /* Quiet at rest like the app's own thumbs; hover gives a clear grab target. */
  --oc-scrollbar-thumb: color-mix(in srgb, var(--oc-muted, currentColor) 18%, transparent);
  --oc-scrollbar-thumb-hover: color-mix(in srgb, var(--oc-muted, currentColor) 36%, transparent);
  scrollbar-gutter: stable;
}
* {
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
}
:hover, [${GUEST_SCROLLING_ATTRIBUTE}] {
  scrollbar-color: var(--oc-scrollbar-thumb) transparent;
}
/* Chromium's standard scrollbar properties otherwise override its pseudo-elements. */
@supports selector(::-webkit-scrollbar) {
  *, :hover, [${GUEST_SCROLLING_ATTRIBUTE}] { scrollbar-width: auto; scrollbar-color: auto; }
  ::-webkit-scrollbar { width: 6px; height: 6px; background: transparent; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 999px;
    min-width: 24px;
    min-height: 24px;
  }
  :hover::-webkit-scrollbar-thumb, [${GUEST_SCROLLING_ATTRIBUTE}]::-webkit-scrollbar-thumb { background: var(--oc-scrollbar-thumb); }
  ::-webkit-scrollbar-thumb:hover { background: var(--oc-scrollbar-thumb-hover); }
  ::-webkit-scrollbar-corner { background: transparent; }
  ::-webkit-scrollbar-button { display: none; width: 0; height: 0; }
}
@media (forced-colors: active) {
  *, :hover, [${GUEST_SCROLLING_ATTRIBUTE}] { scrollbar-color: auto; }
  ::-webkit-scrollbar-thumb, ::-webkit-scrollbar-thumb:hover { background: CanvasText; }
}
`;
  function installGuestScrollbarActivity(doc) {
    const root = doc.documentElement;
    if (root.hasAttribute("data-oc-scrollbar-activity"))
      return;
    root.setAttribute("data-oc-scrollbar-activity", "");
    const timers = /* @__PURE__ */ new WeakMap();
    doc.addEventListener("scroll", (event) => {
      const target = event.target === doc ? root : event.target;
      if (!(target instanceof Element))
        return;
      if (!target.hasAttribute("data-oc-scrolling"))
        target.setAttribute("data-oc-scrolling", "");
      const pending = timers.get(target);
      if (pending !== void 0)
        clearTimeout(pending);
      timers.set(target, setTimeout(() => {
        timers.delete(target);
        target.removeAttribute("data-oc-scrolling");
      }, 1e3));
    }, { capture: true, passive: true });
  }
  var GUEST_SCROLLBAR_SCRIPT = `(${installGuestScrollbarActivity.toString()})(document);`;

  // node_modules/@openchamber/sdk/dist/workspace.js
  var GUEST_STORAGE_KEY_MAX = 128;
  var GUEST_STORAGE_VALUE_BYTES = 65536;

  // node_modules/@openchamber/sdk/dist/shells.js
  var GUEST_SHELL_ID_MAX = 128;
  var GUEST_SHELL_OUTPUT_TAIL_MAX = 65536;

  // node_modules/@openchamber/sdk/dist/status-controls.js
  var GUEST_STATUS_CONTROLS_MAX = 4;
  var GUEST_STATUS_CONTROL_ID = /^[a-z][a-z0-9-]{0,39}$/;
  var GUEST_STATUS_CONTROL_LABEL_MAX = 60;
  var GUEST_STATUS_CONTROL_OPTIONS_MAX = 16;
  var GUEST_STATUS_CONTROL_VALUE_MAX = 80;
  var isControlObject = (value) => Object(value) === value && !Array.isArray(value);
  var hasOnlyKeys = (value, keys2) => Object.keys(value).every((key) => keys2.includes(key));
  var isLabel = (value) => String(value) === value && value.length >= 1 && value.length <= GUEST_STATUS_CONTROL_LABEL_MAX;
  var isValue = (value) => String(value) === value && value.length >= 1 && value.length <= GUEST_STATUS_CONTROL_VALUE_MAX;
  var isGuestStatusControls = (controls) => {
    if (!Array.isArray(controls) || controls.length > GUEST_STATUS_CONTROLS_MAX)
      return false;
    const ids = /* @__PURE__ */ new Set();
    for (const control of controls) {
      if (!isControlObject(control) || !GUEST_STATUS_CONTROL_ID.test(control.id) || !isLabel(control.label))
        return false;
      if (control.disabled !== void 0 && control.disabled !== true && control.disabled !== false)
        return false;
      if (ids.has(control.id))
        return false;
      ids.add(control.id);
      if (control.kind === "button") {
        if (!hasOnlyKeys(control, ["kind", "id", "label", "disabled"]))
          return false;
        continue;
      }
      if (control.kind !== "select" || !hasOnlyKeys(control, ["kind", "id", "label", "value", "options", "disabled"]))
        return false;
      if (!isValue(control.value) || !Array.isArray(control.options) || control.options.length < 1 || control.options.length > GUEST_STATUS_CONTROL_OPTIONS_MAX)
        return false;
      const values = /* @__PURE__ */ new Set();
      for (const option of control.options) {
        if (!isControlObject(option) || !hasOnlyKeys(option, ["value", "label"]) || !isValue(option.value) || !isLabel(option.label) || values.has(option.value))
          return false;
        values.add(option.value);
      }
      if (!values.has(control.value))
        return false;
    }
    return true;
  };

  // node_modules/@openchamber/sdk/dist/manifest.js
  var TRACKER_URL_TOKENS = ["{id}", "{segment}", "{segments+}"];
  var TRACKER_URL_TOKEN_SET = new Set(TRACKER_URL_TOKENS);

  // node_modules/@openchamber/sdk/dist/session-events.js
  var GUEST_SESSION_EVENT_TYPES = [
    "turn-finished",
    "turn-failed",
    "permission-asked",
    "question-asked",
    "turn-started",
    "session-created",
    "session-archived",
    "session-deleted"
  ];
  var SESSION_EVENTS_IDLE_MS = 10 * 6e4;
  var EVENT_TYPES = new Set(GUEST_SESSION_EVENT_TYPES);

  // node_modules/@openchamber/sdk/dist/service-host.js
  var SERVICE_SCHEDULE_IDLE_MS = 10 * 6e4;
  var MENTIONS_IDLE_MS = 10 * 6e4;

  // node_modules/@openchamber/sdk/dist/file-editor.js
  var GUEST_FILE_EDITOR_CONTENT_MAX = 2e7;
  var GUEST_FILE_EDITOR_VERSION_MAX = 256;
  var fileEditorPayloadSize = (value) => "bytes" in value ? value.bytes.byteLength : value.content.length;
  var sameFileEditorDocument = (left, right) => {
    if (left.path !== right.path || left.readOnly !== right.readOnly)
      return false;
    if (left.encoding === "text" || right.encoding === "text") {
      return left.encoding === "text" && right.encoding === "text" && left.content === right.content;
    }
    if (left.bytes.byteLength !== right.bytes.byteLength)
      return false;
    for (let index = 0; index < left.bytes.byteLength; index += 1) {
      if (left.bytes[index] !== right.bytes[index])
        return false;
    }
    return true;
  };

  // node_modules/@openchamber/sdk/dist/popover.js
  var GUEST_POPOVER_ID = /^[A-Za-z0-9_-]{1,80}$/;
  var GUEST_POPOVER_COORDINATE_MAX = 1e5;
  var GUEST_POPOVER_WIDTH_MIN = 160;
  var GUEST_POPOVER_WIDTH_MAX = 640;
  var GUEST_POPOVER_HEIGHT_MIN = 48;
  var GUEST_POPOVER_HEIGHT_MAX = 480;
  var GUEST_POPOVER_DATA_MAX = 16e3;
  var GUEST_POPOVER_DATA_DEPTH_MAX = 32;
  var GUEST_POPOVER_SIDES = ["left", "right", "top", "bottom"];
  var hasBoundedJsonTree = (value, depth = 0, budget = { remaining: GUEST_POPOVER_DATA_MAX }) => {
    if (--budget.remaining < 0 || depth >= GUEST_POPOVER_DATA_DEPTH_MAX)
      return false;
    if (value === null)
      return true;
    const children = Array.isArray(value) ? value : Object(value) === value ? Object.values(value) : [];
    for (const item of children) {
      if (!hasBoundedJsonTree(item, depth + 1, budget))
        return false;
    }
    return true;
  };
  var isFiniteJson = (value) => {
    if (value === null || value === true || value === false)
      return true;
    if (Array.isArray(value))
      return Object.keys(value).every((key) => /^(0|[1-9]\d*)$/.test(key) && Number(key) < value.length) && value.every(isFiniteJson);
    if (Object(value) === value) {
      const prototype = Object.getPrototypeOf(value);
      return (prototype === null || prototype === Object.prototype) && Object.values(value).every(isFiniteJson);
    }
    return String(value) === value || Number.isFinite(value);
  };
  var isGuestPopoverRequest = (request) => {
    try {
      if (String(request.id) !== request.id || !GUEST_POPOVER_ID.test(request.id) || !Number.isFinite(request.anchor.x) || Math.abs(request.anchor.x) > GUEST_POPOVER_COORDINATE_MAX || !Number.isFinite(request.anchor.y) || Math.abs(request.anchor.y) > GUEST_POPOVER_COORDINATE_MAX || !Number.isFinite(request.anchor.width) || !Number.isFinite(request.anchor.height) || request.anchor.width <= 0 || request.anchor.height <= 0 || request.anchor.width > GUEST_POPOVER_COORDINATE_MAX || request.anchor.height > GUEST_POPOVER_COORDINATE_MAX || !Number.isInteger(request.width) || request.width < GUEST_POPOVER_WIDTH_MIN || request.width > GUEST_POPOVER_WIDTH_MAX || !Number.isInteger(request.height) || request.height < GUEST_POPOVER_HEIGHT_MIN || request.height > GUEST_POPOVER_HEIGHT_MAX || request.side !== void 0 && !GUEST_POPOVER_SIDES.includes(request.side) || request.focus !== void 0 && request.focus !== true && request.focus !== false || !hasBoundedJsonTree(request.data) || !isFiniteJson(request.data))
        return false;
      return JSON.stringify(request.data).length <= GUEST_POPOVER_DATA_MAX;
    } catch {
      return false;
    }
  };

  // node_modules/@openchamber/sdk/dist/contract.js
  var GUEST_BLOCK_ANSWER_MAX = 2e3;
  var GUEST_FILE_STAT_KINDS = ["file", "directory", "other", "missing"];
  var isStartSessionResult = (value) => Boolean(value && "sessionId" in value);
  var isPromptResult = (value) => Boolean(value && "sent" in value && !("sessionId" in value));
  var GUEST_COMMIT_SHA = /^[0-9a-f]{7,64}$/i;
  var isGuestCommitSha = (value) => GUEST_COMMIT_SHA.test(value);
  var GUEST_TOAST_MAX = 500;
  var GUEST_CLIPBOARD_TEXT_MAX = 32e3;
  var GUEST_COMPOSE_TEXT_MAX = 16e3;
  var GUEST_ATTACH_ID_MAX = 128;
  var GUEST_ATTACH_TITLE_MAX = 200;
  var GUEST_ATTACH_URL_MAX = 2e3;
  var GUEST_ATTACH_TEXT_MAX = 16e3;
  var GUEST_ATTACH_AUTHOR_MAX = 80;
  var GUEST_ATTACH_BRANCH_MAX = 200;
  var GUEST_ATTACH_DATA_MAX = 16e3;
  var GUEST_REQUEST_PATH_MAX = 2e3;
  var GUEST_REQUEST_TIMEOUT_MS = 2e4;
  var GUEST_FILE_PATH_MAX = 1024;
  var GUEST_FILE_CONTENT_MAX = 2e6;
  var GUEST_GENERATE_PROMPT_MAX = 64e3;
  var GUEST_GENERATE_SYSTEM_MAX = 8e3;
  var GUEST_GENERATE_OUTPUT_TOKENS_MAX = 4e3;
  var GUEST_GENERATE_TIMEOUT_MS = 96e4;
  var GUEST_GENERATE_LATE_KEEP_MS = 60 * 6e4;
  var GUEST_BADGE_MAX = 999;
  var GUEST_FRAME_HEIGHT_MAX = 1e4;
  var GUEST_RESOLVE_ERROR_MAX = 500;
  var HOST_REQUEST_ERROR_CODES = [
    "HOST_UNAVAILABLE",
    "HOST_TIMEOUT",
    "HOST_REJECTED",
    "DISCONNECTED",
    "DISABLED",
    "BAD_PATH",
    "NO_INTEGRATION",
    "NO_SERVICE",
    "SERVICE_FAILED",
    "REQUEST_FAILED",
    "RESPONSE_TOO_LARGE",
    "NO_SESSION",
    "SESSION_BUSY",
    "NOT_GRANTED",
    "NO_DIRECTORY",
    "NOT_FOUND",
    "FILE_TOO_LARGE",
    "DENIED",
    "NO_MODEL",
    "MODEL_FAILED",
    "UNSUPPORTED"
  ];
  var SERVICE_STATUS_VALUES = ["stopped", "starting", "ready", "failed"];
  var hostRequestErrorCodeSet = new Set(HOST_REQUEST_ERROR_CODES);
  var isHostRequestErrorCode = (value) => hostRequestErrorCodeSet.has(value);
  var resolveHostRequestErrorCode = (value) => value && isHostRequestErrorCode(value) ? value : "HOST_REJECTED";
  var isJsonValue = (value) => {
    if (value === void 0)
      return false;
    if (value === null || value === true || value === false)
      return true;
    if (String(value) === value)
      return true;
    if (Number(value) === value)
      return Number.isFinite(value);
    if (Array.isArray(value))
      return value.every(isJsonValue);
    if (Object(value) === value)
      return Object.values(value).every(isJsonValue);
    return false;
  };
  var isAttachData = (value) => isJsonValue(value) && JSON.stringify(value).length <= GUEST_ATTACH_DATA_MAX;
  var clampBranch = (value) => value?.trim().slice(0, GUEST_ATTACH_BRANCH_MAX) ?? "";
  var clampAttachRequest = (request) => {
    const id = request.id.trim().slice(0, GUEST_ATTACH_ID_MAX);
    const title = request.title.trim().slice(0, GUEST_ATTACH_TITLE_MAX);
    const url = request.url.trim().slice(0, GUEST_ATTACH_URL_MAX);
    const text = request.text?.trim().slice(0, GUEST_ATTACH_TEXT_MAX);
    const author = request.author?.trim().slice(0, GUEST_ATTACH_AUTHOR_MAX);
    const kind = request.kind === "pull" ? "pull" : "issue";
    const next = {
      providerId: request.providerId.trim(),
      id,
      title: title || id,
      url,
      kind
    };
    if (text) {
      next.text = text;
    }
    if (author) {
      next.author = author;
    }
    if (kind === "pull") {
      const head = clampBranch(request.branches?.head);
      const base = clampBranch(request.branches?.base);
      if (head && base) {
        next.branches = { head, base };
      }
    }
    if (isAttachData(request.data)) {
      next.data = request.data;
    }
    return next;
  };
  var clampStartSessionRequest = (request) => {
    const next = clampAttachRequest(request);
    if (request.projectId)
      next.projectId = request.projectId;
    if (request.navigation)
      next.navigation = request.navigation;
    if (request.worktree) {
      next.worktree = request.worktree;
    }
    return next;
  };
  var clampPromptRequest = (request) => {
    const next = {
      text: request.text.trim().slice(0, GUEST_COMPOSE_TEXT_MAX)
    };
    if (request.send) {
      next.send = true;
    }
    return next;
  };
  var clampBadgeCount = (count) => {
    if (count === null || !Number.isFinite(count))
      return null;
    return Math.min(GUEST_BADGE_MAX, Math.max(0, Math.round(count)));
  };
  var clampFrameHeight = (height) => {
    if (!Number.isFinite(height))
      return 0;
    return Math.min(GUEST_FRAME_HEIGHT_MAX, Math.max(0, Math.ceil(height)));
  };
  var isGuestFilePath = (value) => value.length > 0 && value.length <= GUEST_FILE_PATH_MAX && !value.includes("\0") && !value.includes("\\");
  var isGuestRequestPath = (value) => {
    if (!value.startsWith("/") || value.includes("\0") || value.includes("\\") || value.includes("://")) {
      return false;
    }
    if (value.length > GUEST_REQUEST_PATH_MAX) {
      return false;
    }
    const segments = value.split("/");
    return !segments.some((segment) => segment === "." || segment === "..");
  };
  var serviceStatusSet = new Set(SERVICE_STATUS_VALUES);
  var isServiceStatusResult = (value) => Boolean(value && "status" in value && serviceStatusSet.has(String(value.status)) && !("body" in value));
  var isGuestRequestResult = (value) => Boolean(value && "status" in value && "body" in value && Number.isInteger(value.status));
  var isFileReadResult = (value) => Boolean(value && "content" in value && String(value.content) === value.content);
  var isFileWriteResult = (value) => Boolean(value && "written" in value && value.written === true);
  var isFileListResult = (value) => Boolean(value && "entries" in value && Array.isArray(value.entries));
  var fileStatKindSet = new Set(GUEST_FILE_STAT_KINDS);
  var isFileStatResult = (value) => Boolean(value && "kind" in value && "size" in value && fileStatKindSet.has(String(value.kind)) && Number.isFinite(value.size));
  var isGenerateResult = (value) => Boolean(value && "text" in value && String(value.text) === value.text && !("status" in value));
  var HOST_PUSH_TYPES = /* @__PURE__ */ new Set([
    "workspace",
    "shells",
    "ready",
    "directory",
    "session",
    "connection",
    "settings",
    "session-lifecycle",
    "item",
    "resolve",
    "action",
    "service-event",
    "status-control-event",
    "popover-closed",
    "file-open",
    "file-snapshot",
    "file-saved",
    "generate-late"
  ]);
  var asWireRecord = (data) => Object(data) === data ? data : null;
  var isNonEmptyString = (value) => String(value) === value && value.length > 0;
  var readResultMessage = (wire) => {
    if (!isNonEmptyString(wire.id))
      return null;
    if (wire.ok === true) {
      const message = {
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "result",
        id: wire.id,
        ok: true
      };
      if (Object(wire.payload) === wire.payload) {
        message.payload = wire.payload;
      }
      return message;
    }
    if (wire.ok === false && isNonEmptyString(wire.error)) {
      return {
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "result",
        id: wire.id,
        ok: false,
        error: wire.error,
        code: resolveHostRequestErrorCode(isNonEmptyString(wire.code) ? wire.code : void 0)
      };
    }
    return null;
  };
  var readHostMessage = (data) => {
    const wire = asWireRecord(data);
    if (!wire || wire.channel !== OPENCHAMBER_SDK_CHANNEL || wire.v !== OPENCHAMBER_SDK_API_VERSION)
      return null;
    if (wire.type === "result")
      return readResultMessage(wire);
    if (!HOST_PUSH_TYPES.has(String(wire.type)) || Object(wire.payload) !== wire.payload)
      return null;
    return wire;
  };

  // node_modules/@openchamber/sdk/dist/host.js
  var isKeyEvent = (event) => "key" in event && "metaKey" in event && "ctrlKey" in event;
  var isSaveShortcut = (event) => (event.metaKey || event.ctrlKey) && !event.altKey && !event.shiftKey && event.key.toLowerCase() === "s";
  var HostRequestError = class extends Error {
    constructor(code, message) {
      super(message);
      __publicField(this, "code");
      this.name = "HostRequestError";
      this.code = code;
    }
  };
  var rejectBadPath = () => Promise.reject(new HostRequestError("BAD_PATH", 'Request path must start with "/" and stay on the declared origin.'));
  var rejectBadFilePath = () => Promise.reject(new HostRequestError("BAD_PATH", `File path must be 1 to ${GUEST_FILE_PATH_MAX} characters without NUL or backslash.`));
  var deviceStorageScope = (options) => {
    if (options === void 0)
      return void 0;
    if (Object(options) !== options || Array.isArray(options) || options.scope !== void 0 && options.scope !== "instance" && options.scope !== "device") {
      throw new HostRequestError("HOST_REJECTED", 'Storage scope must be "instance" or "device".');
    }
    return options.scope === "device" ? "device" : void 0;
  };
  var nextId = (n) => {
    n.value += 1;
    return `oc-${n.value}`;
  };
  var connectHost = (options = {}) => {
    const target = options.target ?? ("window" in globalThis ? window : null);
    if (!target) {
      throw new HostRequestError("HOST_UNAVAILABLE", "No window. connectHost runs in a browser frame.");
    }
    const acceptSource = options.acceptSource ?? ((source) => source === target.parent);
    const requestTimeoutMs = options.requestTimeoutMs ?? GUEST_REQUEST_TIMEOUT_MS;
    const readyListeners = /* @__PURE__ */ new Set();
    const directoryListeners = /* @__PURE__ */ new Set();
    const sessionListeners = /* @__PURE__ */ new Set();
    const lifecycleListeners = /* @__PURE__ */ new Set();
    const connectionListeners = /* @__PURE__ */ new Set();
    const settingsListeners = /* @__PURE__ */ new Set();
    const itemListeners = /* @__PURE__ */ new Set();
    const blockListeners = /* @__PURE__ */ new Set();
    const serviceEventListeners = /* @__PURE__ */ new Set();
    const statusControlListeners = /* @__PURE__ */ new Set();
    const popoverClosedListeners = /* @__PURE__ */ new Set();
    const lateGenerateListeners = /* @__PURE__ */ new Set();
    const unclaimedLateGenerate = [];
    let resolveHandler = null;
    let actionHandler = null;
    const fileOpenListeners = /* @__PURE__ */ new Set();
    const fileSavedListeners = /* @__PURE__ */ new Set();
    let fileSnapshotHandler = null;
    let lastFile = null;
    let saveShortcutInstalled = false;
    const pending = /* @__PURE__ */ new Map();
    const workspaceListeners = /* @__PURE__ */ new Map();
    const shellsListeners = /* @__PURE__ */ new Map();
    let disposed = false;
    const ids = { value: 0 };
    let lastReady = null;
    let lastLifecycle = null;
    let popoverPointerActive = false;
    let popoverFocusActive = false;
    let popoverActivityReported = null;
    const lifecycleFromSession = (session) => {
      if (!session)
        return null;
      return {
        sessionId: session.id,
        phase: session.busy ? "started" : "completed"
      };
    };
    const post = (message) => {
      target.parent.postMessage(message, "*");
    };
    const listenForLateGenerate = () => {
      if (disposed || target.parent === target || lateGenerateListeners.size === 0 || lastReady?.features?.lateGenerateResults !== true)
        return;
      post({ channel: OPENCHAMBER_SDK_CHANNEL, v: OPENCHAMBER_SDK_API_VERSION, type: "generate-late-listen" });
    };
    const emit = (listeners, value) => {
      for (const listener of listeners) {
        try {
          listener(value);
        } catch (error) {
          console.error(error);
        }
      }
    };
    const onMessage = (event) => {
      if (!(event instanceof MessageEvent))
        return;
      if (!acceptSource(event.source))
        return;
      const message = readHostMessage(event.data);
      if (!message)
        return;
      if (message.type === "workspace") {
        const listener = workspaceListeners.get(message.payload.subscriptionId);
        if (listener)
          emit([listener], message.payload.snapshot);
        return;
      }
      if (message.type === "shells") {
        const listener = shellsListeners.get(message.payload.subscriptionId);
        if (listener)
          emit([listener], message.payload.snapshot);
        return;
      }
      if (message.type === "ready") {
        lastReady = message.payload;
        lastLifecycle = lifecycleFromSession(message.payload.session);
        emit(readyListeners, message.payload);
        emit(directoryListeners, message.payload.directory);
        emit(sessionListeners, message.payload.session);
        if (lastLifecycle) {
          emit(lifecycleListeners, lastLifecycle);
        }
        emit(connectionListeners, message.payload.connection);
        emit(settingsListeners, message.payload.settings);
        emit(itemListeners, message.payload.item);
        if (message.payload.block)
          emit(blockListeners, message.payload.block);
        listenForLateGenerate();
        return;
      }
      if (message.type === "service-event") {
        emit(serviceEventListeners, message.payload);
        return;
      }
      if (message.type === "generate-late") {
        if (lateGenerateListeners.size === 0)
          unclaimedLateGenerate.push(message.payload);
        else
          emit(lateGenerateListeners, message.payload);
        return;
      }
      if (message.type === "directory") {
        if (lastReady) {
          lastReady = { ...lastReady, directory: message.payload.directory };
        }
        emit(directoryListeners, message.payload.directory);
        return;
      }
      if (message.type === "session") {
        if (lastReady) {
          lastReady = { ...lastReady, session: message.payload.session };
        }
        if (!message.payload.session) {
          lastLifecycle = null;
        } else if (lastLifecycle?.sessionId !== message.payload.session.id) {
          lastLifecycle = lifecycleFromSession(message.payload.session);
        }
        emit(sessionListeners, message.payload.session);
        return;
      }
      if (message.type === "session-lifecycle") {
        lastLifecycle = message.payload;
        emit(lifecycleListeners, message.payload);
        return;
      }
      if (message.type === "connection") {
        if (lastReady) {
          lastReady = { ...lastReady, connection: message.payload.connection };
        }
        emit(connectionListeners, message.payload.connection);
        return;
      }
      if (message.type === "settings") {
        if (lastReady) {
          lastReady = { ...lastReady, settings: message.payload.settings };
        }
        emit(settingsListeners, message.payload.settings);
        return;
      }
      if (message.type === "item") {
        if (lastReady) {
          lastReady = { ...lastReady, item: message.payload.item };
        }
        emit(itemListeners, message.payload.item);
        return;
      }
      if (message.type === "status-control-event") {
        emit(statusControlListeners, message.payload);
        return;
      }
      if (message.type === "popover-closed") {
        emit(popoverClosedListeners, message.payload);
        return;
      }
      if (message.type === "action") {
        const answer = (payload) => {
          if (!disposed)
            post({
              channel: OPENCHAMBER_SDK_CHANNEL,
              v: OPENCHAMBER_SDK_API_VERSION,
              type: "action-result",
              id: message.id,
              payload
            });
        };
        const handler = actionHandler;
        if (!handler) {
          answer({ ok: false, error: "This extension does not handle background actions." });
          return;
        }
        Promise.resolve().then(() => handler(message.payload)).then(() => answer({ ok: true }), (error) => {
          const text = (error instanceof Error ? error.message : String(error)).trim();
          answer({ ok: false, error: (text || "Action failed.").slice(0, GUEST_RESOLVE_ERROR_MAX) });
        });
        return;
      }
      if (message.type === "file-open") {
        const next = message.payload;
        if (lastFile && sameFileEditorDocument(lastFile, next))
          return;
        lastFile = next;
        emit(fileOpenListeners, message.payload);
        return;
      }
      if (message.type === "file-saved") {
        emit(fileSavedListeners, message.payload.version);
        return;
      }
      if (message.type === "file-snapshot") {
        const answer = (payload) => {
          if (!disposed)
            post({
              channel: OPENCHAMBER_SDK_CHANNEL,
              v: OPENCHAMBER_SDK_API_VERSION,
              type: "file-snapshot-result",
              id: message.id,
              payload
            });
        };
        const fail = (text) => answer({ error: (text.trim() || "Could not read the edited file.").slice(0, GUEST_RESOLVE_ERROR_MAX) });
        const handler = fileSnapshotHandler;
        if (!handler) {
          fail("This extension does not edit files.");
          return;
        }
        Promise.resolve().then(() => handler(message.payload.purpose)).then((snapshot) => {
          if (fileEditorPayloadSize(snapshot) > GUEST_FILE_EDITOR_CONTENT_MAX) {
            fail(`The file is over ${GUEST_FILE_EDITOR_CONTENT_MAX} ${"bytes" in snapshot ? "bytes" : "characters"}.`);
            return;
          }
          if (snapshot.version.length > GUEST_FILE_EDITOR_VERSION_MAX) {
            fail(`The snapshot version is over ${GUEST_FILE_EDITOR_VERSION_MAX} characters.`);
            return;
          }
          answer({ snapshot: "bytes" in snapshot ? { bytes: snapshot.bytes, version: snapshot.version } : { content: snapshot.content, version: snapshot.version } });
        }, (error) => fail(error instanceof Error ? error.message : String(error)));
        return;
      }
      if (message.type === "resolve") {
        const answer = (payload) => {
          post({
            channel: OPENCHAMBER_SDK_CHANNEL,
            v: OPENCHAMBER_SDK_API_VERSION,
            type: "resolve-result",
            id: message.id,
            payload
          });
        };
        const handler = resolveHandler;
        if (!handler) {
          answer({ error: "This extension does not resolve commands." });
          return;
        }
        Promise.resolve().then(() => handler(message.payload)).then((item) => answer({ item: item ? clampAttachRequest(item) : null }), (error) => {
          const text = (error instanceof Error ? error.message : String(error)).trim();
          answer({ error: (text || "Command failed.").slice(0, GUEST_RESOLVE_ERROR_MAX) });
        });
        return;
      }
      const waiter = pending.get(message.id);
      if (!waiter)
        return;
      clearTimeout(waiter.timer);
      pending.delete(message.id);
      if (message.ok) {
        waiter.resolve(message.payload);
        return;
      }
      waiter.reject(new HostRequestError(message.code, message.error));
    };
    target.addEventListener("message", onMessage);
    post({
      channel: OPENCHAMBER_SDK_CHANNEL,
      v: OPENCHAMBER_SDK_API_VERSION,
      type: "hello"
    });
    const send = (message, timeoutMs = requestTimeoutMs) => {
      if (disposed || target.parent === target) {
        return Promise.reject(new HostRequestError("HOST_UNAVAILABLE", "No host frame. This page is not in an iframe."));
      }
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          pending.delete(message.id);
          reject(new HostRequestError("HOST_TIMEOUT", "Host did not answer in time."));
        }, timeoutMs);
        pending.set(message.id, { resolve, reject, timer });
        post(message);
      });
    };
    const request = (message) => send(message).then(() => void 0);
    const envelope = { channel: OPENCHAMBER_SDK_CHANNEL, v: OPENCHAMBER_SDK_API_VERSION };
    const notify = (message) => {
      if (!disposed && target.parent !== target)
        post(message);
    };
    const requestFileSave = () => notify({ ...envelope, type: "file-save" });
    const onSaveShortcut = (event) => {
      if (!isKeyEvent(event) || !isSaveShortcut(event))
        return;
      event.preventDefault();
      requestFileSave();
    };
    const onPopoverEscape = (event) => {
      if (!isKeyEvent(event) || event.key !== "Escape" || lastReady?.surface !== "popover" || !lastReady.popover)
        return;
      event.preventDefault();
      void closePopover(lastReady.popover.id, "escape").catch(() => void 0);
    };
    const reportPopoverActivity = () => {
      const popover = lastReady?.surface === "popover" ? lastReady.popover : void 0;
      if (!popover)
        return;
      const active2 = popoverPointerActive || popoverFocusActive;
      if (popoverActivityReported === active2)
        return;
      popoverActivityReported = active2;
      void setPopoverAnchorActive(popover.id, active2).catch(() => void 0);
    };
    const onPopoverPointerOver = () => {
      if (lastReady?.surface !== "popover" || popoverPointerActive)
        return;
      popoverPointerActive = true;
      reportPopoverActivity();
    };
    const onPopoverPointerOut = (event) => {
      if (lastReady?.surface !== "popover" || event.relatedTarget !== null || !popoverPointerActive)
        return;
      popoverPointerActive = false;
      reportPopoverActivity();
    };
    const onPopoverFocus = () => {
      if (lastReady?.surface !== "popover" || popoverFocusActive)
        return;
      popoverFocusActive = true;
      reportPopoverActivity();
    };
    const onPopoverBlur = () => {
      if (lastReady?.surface !== "popover" || !popoverFocusActive)
        return;
      popoverFocusActive = false;
      reportPopoverActivity();
    };
    const requireIdentity = (value, maximum = 1024) => {
      if (!value.trim() || value.length > maximum)
        throw new HostRequestError("HOST_REJECTED", `Identity must contain 1 to ${maximum} characters.`);
    };
    const readWorkspace = async (query) => {
      if (query.kind !== "projects")
        requireIdentity(query.projectId);
      const result = await send({ ...envelope, type: "workspace-read", id: nextId(ids), payload: query });
      if (!result || !("kind" in result) || !("state" in result) || result.kind !== query.kind) {
        throw new HostRequestError("HOST_REJECTED", "Host did not return workspace data.");
      }
      return result;
    };
    const subscribeWorkspace = async (query, listener) => {
      if (query.kind !== "projects")
        requireIdentity(query.projectId);
      const subscriptionId = nextId(ids);
      workspaceListeners.set(subscriptionId, listener);
      try {
        await request({ ...envelope, type: "workspace-subscribe", id: nextId(ids), payload: { subscriptionId, query } });
      } catch (error) {
        workspaceListeners.delete(subscriptionId);
        if (!disposed)
          post({ ...envelope, type: "workspace-unsubscribe", id: nextId(ids), payload: { subscriptionId } });
        throw error;
      }
      return () => {
        if (!workspaceListeners.delete(subscriptionId) || disposed)
          return;
        post({ ...envelope, type: "workspace-unsubscribe", id: nextId(ids), payload: { subscriptionId } });
      };
    };
    const subscribeShells = async (scope, listener) => {
      if (scope.kind === "session")
        requireIdentity(scope.sessionId);
      if (scope.kind === "project")
        requireIdentity(scope.projectId);
      const subscriptionId = nextId(ids);
      shellsListeners.set(subscriptionId, listener);
      try {
        await request({ ...envelope, type: "shells-subscribe", id: nextId(ids), payload: { subscriptionId, scope } });
      } catch (error) {
        shellsListeners.delete(subscriptionId);
        if (!disposed)
          post({ ...envelope, type: "shells-unsubscribe", id: nextId(ids), payload: { subscriptionId } });
        throw error;
      }
      return () => {
        if (!shellsListeners.delete(subscriptionId) || disposed)
          return;
        post({ ...envelope, type: "shells-unsubscribe", id: nextId(ids), payload: { subscriptionId } });
      };
    };
    const storage = async (payload) => {
      if ("key" in payload && (payload.key.length === 0 || payload.key.length > GUEST_STORAGE_KEY_MAX)) {
        throw new HostRequestError("HOST_REJECTED", "Storage key must contain 1 to 128 characters.");
      }
      if (payload.op === "set" && !isJsonValue(payload.value)) {
        throw new HostRequestError("HOST_REJECTED", "Storage values must be JSON.");
      }
      if (payload.op === "set" && new TextEncoder().encode(JSON.stringify(payload.value)).length > GUEST_STORAGE_VALUE_BYTES) {
        throw new HostRequestError("HOST_REJECTED", "Storage value exceeds 64 KiB.");
      }
      if (payload.scope === "device" && lastReady?.features?.deviceStorage !== true) {
        throw new HostRequestError("UNSUPPORTED", "This host does not support device storage.");
      }
      const result = await send({ ...envelope, type: "storage", id: nextId(ids), payload });
      if (!result || !("storage" in result) || result.op !== payload.op)
        throw new HostRequestError("HOST_REJECTED", "Host did not return storage data.");
      return result;
    };
    const closePopover = (id, reason) => lastReady?.features?.popovers !== true && !(lastReady?.surface === "popover" && lastReady.popover?.id === id) ? Promise.reject(new HostRequestError("UNSUPPORTED", "This host does not support popovers.")) : request({ ...envelope, type: "popover-close", id: nextId(ids), payload: reason ? { id, reason } : { id } });
    const setPopoverAnchorActive = (id, active2) => lastReady?.features?.popovers !== true && !(lastReady?.surface === "popover" && lastReady.popover?.id === id) ? Promise.reject(new HostRequestError("UNSUPPORTED", "This host does not support popovers.")) : request({ ...envelope, type: "popover-anchor", id: nextId(ids), payload: { id, active: active2 } });
    target.addEventListener("keydown", onPopoverEscape, true);
    target.addEventListener("pointerover", onPopoverPointerOver);
    target.addEventListener("pointermove", onPopoverPointerOver);
    target.addEventListener("pointerout", onPopoverPointerOut);
    target.addEventListener("focus", onPopoverFocus);
    target.addEventListener("blur", onPopoverBlur);
    return {
      onAction: (handler) => {
        actionHandler = handler;
        return () => {
          if (actionHandler === handler)
            actionHandler = null;
        };
      },
      listProjects: async () => {
        const result = await readWorkspace({ kind: "projects" });
        if (result.kind !== "projects")
          throw new HostRequestError("HOST_REJECTED", "Expected projects.");
        return result;
      },
      listWorktrees: async (projectId) => {
        const result = await readWorkspace({ kind: "worktrees", projectId });
        if (result.kind !== "worktrees")
          throw new HostRequestError("HOST_REJECTED", "Expected worktrees.");
        return result;
      },
      listSessions: async (projectId) => {
        const result = await readWorkspace({ kind: "sessions", projectId });
        if (result.kind !== "sessions")
          throw new HostRequestError("HOST_REJECTED", "Expected sessions.");
        return result;
      },
      onProjects: (listener) => subscribeWorkspace({ kind: "projects" }, (snapshot) => {
        if (snapshot.kind === "projects")
          listener(snapshot);
      }),
      onWorktrees: (projectId, listener) => subscribeWorkspace({ kind: "worktrees", projectId }, (snapshot) => {
        if (snapshot.kind === "worktrees")
          listener(snapshot);
      }),
      onSessions: (projectId, listener) => subscribeWorkspace({ kind: "sessions", projectId }, (snapshot) => {
        if (snapshot.kind === "sessions")
          listener(snapshot);
      }),
      onRunningShells: (scope, listener) => subscribeShells(scope, listener),
      readShellOutput: async (shellId, options2) => {
        requireIdentity(shellId, GUEST_SHELL_ID_MAX);
        const cursor = options2?.cursor;
        if (cursor !== void 0 && (!Number.isInteger(cursor) || cursor < 0)) {
          throw new HostRequestError("HOST_REJECTED", "Shell output cursor must be a non-negative integer.");
        }
        const tailBytes = options2?.tailBytes;
        if (tailBytes !== void 0 && (!Number.isInteger(tailBytes) || tailBytes < 1 || tailBytes > GUEST_SHELL_OUTPUT_TAIL_MAX)) {
          throw new HostRequestError("HOST_REJECTED", `Shell output tailBytes must be an integer between 1 and ${GUEST_SHELL_OUTPUT_TAIL_MAX}.`);
        }
        const result = await send({ ...envelope, type: "shell-output", id: nextId(ids), payload: { shellId, cursor, tailBytes } });
        const output = result;
        if (!output || typeof output.output !== "string" || !Number.isFinite(output.cursor)) {
          throw new HostRequestError("HOST_REJECTED", "Host did not return shell output.");
        }
        return output;
      },
      stopShell: async (shellId) => {
        requireIdentity(shellId, GUEST_SHELL_ID_MAX);
        const result = await send({ ...envelope, type: "shell-stop", id: nextId(ids), payload: { shellId } });
        if (result?.stopped !== true)
          throw new HostRequestError("HOST_REJECTED", "Host did not stop the shell.");
        return { stopped: true };
      },
      openSession: async (sessionId) => {
        requireIdentity(sessionId);
        await request({ ...envelope, type: "open-session", id: nextId(ids), payload: { sessionId } });
      },
      storage: {
        get: async (key, options2) => {
          const scope = deviceStorageScope(options2);
          const payload = { op: "get", key };
          if (scope)
            payload.scope = scope;
          const result = await storage(payload);
          return result.op === "get" && result.found ? result.value : void 0;
        },
        set: async (key, value, options2) => {
          const scope = deviceStorageScope(options2);
          const payload = { op: "set", key, value };
          if (scope)
            payload.scope = scope;
          await storage(payload);
        },
        delete: async (key, options2) => {
          const scope = deviceStorageScope(options2);
          const payload = { op: "delete", key };
          if (scope)
            payload.scope = scope;
          await storage(payload);
        },
        keys: async (options2) => {
          const scope = deviceStorageScope(options2);
          const payload = { op: "keys" };
          if (scope)
            payload.scope = scope;
          const result = await storage(payload);
          if (result.op !== "keys")
            throw new HostRequestError("HOST_REJECTED", "Expected storage keys.");
          return result.keys;
        }
      },
      onReady: (listener) => {
        readyListeners.add(listener);
        if (lastReady)
          listener(lastReady);
        return () => {
          readyListeners.delete(listener);
        };
      },
      onDirectory: (listener) => {
        directoryListeners.add(listener);
        if (lastReady)
          listener(lastReady.directory);
        return () => {
          directoryListeners.delete(listener);
        };
      },
      onSession: (listener) => {
        sessionListeners.add(listener);
        if (lastReady)
          listener(lastReady.session);
        return () => {
          sessionListeners.delete(listener);
        };
      },
      onSessionLifecycle: (listener) => {
        lifecycleListeners.add(listener);
        if (lastLifecycle)
          listener(lastLifecycle);
        return () => {
          lifecycleListeners.delete(listener);
        };
      },
      onConnection: (listener) => {
        connectionListeners.add(listener);
        if (lastReady)
          listener(lastReady.connection);
        return () => {
          connectionListeners.delete(listener);
        };
      },
      onSettings: (listener) => {
        settingsListeners.add(listener);
        if (lastReady)
          listener(lastReady.settings);
        return () => {
          settingsListeners.delete(listener);
        };
      },
      onItem: (listener) => {
        itemListeners.add(listener);
        if (lastReady)
          listener(lastReady.item);
        return () => {
          itemListeners.delete(listener);
        };
      },
      onBlock: (listener) => {
        blockListeners.add(listener);
        if (lastReady?.block)
          listener(lastReady.block);
        return () => {
          blockListeners.delete(listener);
        };
      },
      onServiceEvent: (listener) => {
        serviceEventListeners.add(listener);
        return () => {
          serviceEventListeners.delete(listener);
        };
      },
      onStatusControl: (listener) => {
        statusControlListeners.add(listener);
        return () => {
          statusControlListeners.delete(listener);
        };
      },
      onPopoverClosed: (listener) => {
        popoverClosedListeners.add(listener);
        return () => {
          popoverClosedListeners.delete(listener);
        };
      },
      setStatusControls: (controls) => {
        if (lastReady?.features?.statusControls !== true) {
          return Promise.reject(new HostRequestError("UNSUPPORTED", "This host does not support status controls."));
        }
        if (!isGuestStatusControls(controls)) {
          return Promise.reject(new HostRequestError("HOST_REJECTED", "Status controls must have unique bounded ids and valid selected options."));
        }
        return request({ ...envelope, type: "status-controls", id: nextId(ids), payload: { controls } });
      },
      openPopover: (payload) => {
        if (lastReady?.features?.popovers !== true) {
          return Promise.reject(new HostRequestError("UNSUPPORTED", "This host does not support popovers."));
        }
        if (!isGuestPopoverRequest(payload)) {
          return Promise.reject(new HostRequestError("HOST_REJECTED", "Popover requests need bounded geometry and JSON data."));
        }
        return request({ ...envelope, type: "popover-open", id: nextId(ids), payload });
      },
      closePopover,
      setPopoverAnchorActive,
      onResolve: (handler) => {
        resolveHandler = handler;
        return () => {
          if (resolveHandler === handler)
            resolveHandler = null;
        };
      },
      toast: (payload) => {
        const message = payload.message.trim();
        if (!message || message.length > GUEST_TOAST_MAX) {
          return Promise.reject(new HostRequestError("HOST_REJECTED", `Toast message must contain 1 to ${GUEST_TOAST_MAX} characters.`));
        }
        if (payload.copy && payload.copy !== true && (!payload.copy.text.length || payload.copy.text.length > GUEST_CLIPBOARD_TEXT_MAX)) {
          return Promise.reject(new HostRequestError("HOST_REJECTED", `Toast copy text must contain 1 to ${GUEST_CLIPBOARD_TEXT_MAX} characters.`));
        }
        return request({
          channel: OPENCHAMBER_SDK_CHANNEL,
          v: OPENCHAMBER_SDK_API_VERSION,
          type: "toast",
          id: nextId(ids),
          payload: { ...payload, message }
        });
      },
      openUrl: (url) => request({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "open-url",
        id: nextId(ids),
        payload: { url }
      }),
      openCommit: (sha) => isGuestCommitSha(sha) ? request({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "open-commit",
        id: nextId(ids),
        payload: { sha }
      }) : Promise.reject(new HostRequestError("HOST_REJECTED", "Commit id must be 7 to 64 hex characters.")),
      answerBlock: (text) => request({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "block-answer",
        id: nextId(ids),
        payload: { text: text.trim().slice(0, GUEST_BLOCK_ANSWER_MAX) }
      }),
      openSurface: (surfaceId) => request({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "open-surface",
        id: nextId(ids),
        payload: { surfaceId }
      }),
      writeClipboard: (text) => request({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "clipboard-write",
        id: nextId(ids),
        payload: { text }
      }),
      compose: (payload) => request({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "compose",
        id: nextId(ids),
        payload
      }),
      attach: (payload) => request({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "attach",
        id: nextId(ids),
        payload: clampAttachRequest(payload)
      }),
      startSession: async (payload) => {
        if (payload.projectId !== void 0)
          requireIdentity(payload.projectId);
        const worktree = payload.worktree;
        if (worktree && worktree !== true) {
          if (worktree.kind === "existing")
            requireIdentity(worktree.directory);
          else {
            if (worktree.name !== void 0)
              requireIdentity(worktree.name, 200);
            if (worktree.baseBranch !== void 0)
              requireIdentity(worktree.baseBranch, 200);
          }
        }
        const result = await send({
          channel: OPENCHAMBER_SDK_CHANNEL,
          v: OPENCHAMBER_SDK_API_VERSION,
          type: "start-session",
          id: nextId(ids),
          payload: clampStartSessionRequest(payload)
        }, options.requestTimeoutMs ?? 18e4);
        if (!isStartSessionResult(result)) {
          throw new HostRequestError("HOST_REJECTED", "Host did not return a session.");
        }
        return result;
      },
      prompt: (payload) => send({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "prompt",
        id: nextId(ids),
        payload: clampPromptRequest(payload)
      }).then((result) => {
        if (!isPromptResult(result)) {
          throw new HostRequestError("HOST_REJECTED", "Host did not return a prompt result.");
        }
        return result;
      }),
      sessionLink: (payload) => request({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "session-link",
        id: nextId(ids),
        payload: clampAttachRequest(payload)
      }),
      close: () => request({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "close",
        id: nextId(ids)
      }),
      oauthStart: () => request({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "oauth-start",
        id: nextId(ids)
      }),
      oauthDisconnect: () => request({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "oauth-disconnect",
        id: nextId(ids)
      }),
      request: (payload) => (isGuestRequestPath(payload.path) ? send({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "request",
        id: nextId(ids),
        payload
      }) : rejectBadPath()).then((result) => {
        if (!isGuestRequestResult(result)) {
          throw new HostRequestError("HOST_REJECTED", "Host request result was empty.");
        }
        return result;
      }),
      serviceRequest: (payload) => (isGuestRequestPath(payload.path) ? send({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "service-request",
        id: nextId(ids),
        payload
      }) : rejectBadPath()).then((result) => {
        if (!isGuestRequestResult(result)) {
          throw new HostRequestError("HOST_REJECTED", "Host service request result was empty.");
        }
        return result;
      }),
      serviceStatus: () => send({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "service-status",
        id: nextId(ids)
      }).then((result) => {
        if (!isServiceStatusResult(result)) {
          throw new HostRequestError("HOST_REJECTED", "Host did not return service status.");
        }
        return result;
      }),
      readFile: (path) => (isGuestFilePath(path) ? send({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "file-read",
        id: nextId(ids),
        payload: { path }
      }) : rejectBadFilePath()).then((result) => {
        if (!isFileReadResult(result)) {
          throw new HostRequestError("HOST_REJECTED", "Host did not return file content.");
        }
        return result;
      }),
      writeFile: (path, content) => {
        if (!isGuestFilePath(path)) {
          return rejectBadFilePath();
        }
        if (content.length > GUEST_FILE_CONTENT_MAX) {
          return Promise.reject(new HostRequestError("FILE_TOO_LARGE", `Content is over ${GUEST_FILE_CONTENT_MAX} characters.`));
        }
        return send({
          channel: OPENCHAMBER_SDK_CHANNEL,
          v: OPENCHAMBER_SDK_API_VERSION,
          type: "file-write",
          id: nextId(ids),
          payload: { path, content }
        }).then((result) => {
          if (!isFileWriteResult(result)) {
            throw new HostRequestError("HOST_REJECTED", "Host did not confirm the write.");
          }
          return result;
        });
      },
      listDir: (path) => (isGuestFilePath(path) ? send({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "file-list",
        id: nextId(ids),
        payload: { path }
      }) : rejectBadFilePath()).then((result) => {
        if (!isFileListResult(result)) {
          throw new HostRequestError("HOST_REJECTED", "Host did not return directory entries.");
        }
        return result;
      }),
      stat: (path) => (isGuestFilePath(path) ? send({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "file-stat",
        id: nextId(ids),
        payload: { path }
      }) : rejectBadFilePath()).then((result) => {
        if (!isFileStatResult(result)) {
          throw new HostRequestError("HOST_REJECTED", "Host did not return file status.");
        }
        return result;
      }),
      generate: (input) => {
        const prompt = input.prompt.trim();
        const system = input.system?.trim();
        if (prompt.length === 0 || prompt.length > GUEST_GENERATE_PROMPT_MAX) {
          return Promise.reject(new HostRequestError("HOST_REJECTED", `Prompt must be 1 to ${GUEST_GENERATE_PROMPT_MAX} characters.`));
        }
        if (system !== void 0 && (system.length === 0 || system.length > GUEST_GENERATE_SYSTEM_MAX)) {
          return Promise.reject(new HostRequestError("HOST_REJECTED", `System prompt must be 1 to ${GUEST_GENERATE_SYSTEM_MAX} characters.`));
        }
        const maxOutputTokens = input.maxOutputTokens === void 0 ? void 0 : Math.min(GUEST_GENERATE_OUTPUT_TOKENS_MAX, Math.max(1, Math.floor(input.maxOutputTokens)));
        if (maxOutputTokens !== void 0 && !Number.isFinite(maxOutputTokens)) {
          return Promise.reject(new HostRequestError("HOST_REJECTED", "maxOutputTokens must be a number."));
        }
        const payload = { prompt };
        if (system !== void 0)
          payload.system = system;
        if (maxOutputTokens !== void 0)
          payload.maxOutputTokens = maxOutputTokens;
        return send({
          channel: OPENCHAMBER_SDK_CHANNEL,
          v: OPENCHAMBER_SDK_API_VERSION,
          type: "generate",
          id: nextId(ids),
          payload
        }, options.requestTimeoutMs ?? GUEST_GENERATE_TIMEOUT_MS).then((result) => {
          if (!isGenerateResult(result)) {
            throw new HostRequestError("HOST_REJECTED", "Host did not return generated text.");
          }
          return result;
        });
      },
      onLateGenerateResult: (listener) => {
        lateGenerateListeners.add(listener);
        for (const result of unclaimedLateGenerate.splice(0))
          emit([listener], result);
        listenForLateGenerate();
        return () => {
          lateGenerateListeners.delete(listener);
        };
      },
      setBadge: (count) => request({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "badge",
        id: nextId(ids),
        payload: { count: clampBadgeCount(count) }
      }),
      setHeight: (height) => request({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "resize",
        id: nextId(ids),
        payload: { height: clampFrameHeight(height) }
      }),
      onFileOpen: (listener) => {
        fileOpenListeners.add(listener);
        if (!saveShortcutInstalled) {
          saveShortcutInstalled = true;
          target.addEventListener("keydown", onSaveShortcut, true);
        }
        if (lastFile)
          listener(lastFile);
        return () => {
          fileOpenListeners.delete(listener);
        };
      },
      onFileSnapshot: (handler) => {
        fileSnapshotHandler = handler;
        return () => {
          if (fileSnapshotHandler === handler)
            fileSnapshotHandler = null;
        };
      },
      onFileSaved: (listener) => {
        fileSavedListeners.add(listener);
        return () => {
          fileSavedListeners.delete(listener);
        };
      },
      reportFileChange: (change) => notify({ ...envelope, type: "file-change", payload: { dirty: change.dirty, edited: change.edited } }),
      requestFileSave,
      reportFileUnsupported: () => notify({ ...envelope, type: "file-unsupported" }),
      dispose: () => {
        for (const subscriptionId of workspaceListeners.keys()) {
          post({ ...envelope, type: "workspace-unsubscribe", id: nextId(ids), payload: { subscriptionId } });
        }
        workspaceListeners.clear();
        for (const subscriptionId of shellsListeners.keys()) {
          post({ ...envelope, type: "shells-unsubscribe", id: nextId(ids), payload: { subscriptionId } });
        }
        shellsListeners.clear();
        disposed = true;
        resolveHandler = null;
        actionHandler = null;
        fileSnapshotHandler = null;
        fileOpenListeners.clear();
        fileSavedListeners.clear();
        if (saveShortcutInstalled)
          target.removeEventListener("keydown", onSaveShortcut, true);
        target.removeEventListener("message", onMessage);
        target.removeEventListener("keydown", onPopoverEscape, true);
        target.removeEventListener("pointerover", onPopoverPointerOver);
        target.removeEventListener("pointermove", onPopoverPointerOver);
        target.removeEventListener("pointerout", onPopoverPointerOut);
        target.removeEventListener("focus", onPopoverFocus);
        target.removeEventListener("blur", onPopoverBlur);
        for (const waiter of pending.values()) {
          clearTimeout(waiter.timer);
          waiter.reject(new HostRequestError("HOST_UNAVAILABLE", "Host client was disposed."));
        }
        pending.clear();
        readyListeners.clear();
        directoryListeners.clear();
        sessionListeners.clear();
        lifecycleListeners.clear();
        connectionListeners.clear();
        settingsListeners.clear();
        itemListeners.clear();
        blockListeners.clear();
        serviceEventListeners.clear();
        statusControlListeners.clear();
        popoverClosedListeners.clear();
        lateGenerateListeners.clear();
        unclaimedLateGenerate.length = 0;
      }
    };
  };

  // node_modules/@openchamber/sdk/dist/service-providers.js
  var BROWSER_CONTROL_ACTIONS = [
    "browser.open",
    "browser.snapshot",
    "browser.click",
    "browser.type",
    "browser.select",
    "browser.scroll",
    "browser.back",
    "browser.forward",
    "browser.inspect",
    "browser.capture",
    "browser.resize",
    "browser.close"
  ];
  var BROWSER_PROVIDER_IDLE_MS = 10 * 6e4;
  var CONTROL_ACTIONS = new Set(BROWSER_CONTROL_ACTIONS);
  var SOURCE_CONTROL_PROVIDER_IDLE_MS = 10 * 6e4;
  var NOTIFICATIONS_PROVIDER_IDLE_MS = 10 * 6e4;
  var TRACKER_PROVIDER_IDLE_MS = 10 * 6e4;
  var QUOTA_PROVIDER_IDLE_MS = 10 * 6e4;

  // node_modules/@openchamber/sdk/dist/service-surface.js
  var SURFACE_CONTROLLERS = ["none", "agent", "user"];
  var CONTROLLERS = new Set(SURFACE_CONTROLLERS);

  // node_modules/@openchamber/sdk/dist/ui/theme.js
  var TOKEN_VARS = [
    ["--oc-bg", "background"],
    ["--oc-elevated", "elevated"],
    ["--oc-fg", "foreground"],
    ["--oc-muted", "muted"],
    ["--oc-subtle", "subtle"],
    ["--oc-border", "border"],
    ["--oc-hover", "hover"],
    ["--oc-selection", "selection"],
    ["--oc-focus", "focus"],
    ["--oc-primary", "primary"],
    ["--oc-muted-surface", "mutedSurface"],
    ["--oc-elevated-fg", "elevatedForeground"],
    ["--oc-active", "active"],
    ["--oc-selection-fg", "selectionForeground"],
    ["--oc-primary-fg", "primaryForeground"],
    ["--oc-primary-text", "primaryText"],
    ["--oc-success-text", "successText"],
    ["--oc-warning-text", "warningText"],
    ["--oc-error-text", "errorText"],
    ["--oc-info-text", "infoText"],
    ["--oc-success", "success"],
    ["--oc-warning", "warning"],
    ["--oc-error", "error"],
    ["--oc-info", "info"],
    ["--oc-font", "font"],
    ["--oc-mono", "mono"],
    ["--oc-radius", "radius"],
    ["--surface-background", "background"],
    ["--surface-elevated", "elevated"],
    ["--surface-foreground", "foreground"],
    ["--surface-muted-foreground", "muted"],
    ["--surface-subtle", "subtle"],
    ["--interactive-border", "border"],
    ["--interactive-hover", "hover"],
    ["--interactive-selection", "selection"],
    ["--interactive-focus-ring", "focus"],
    ["--primary", "primary"],
    ["--surface-muted", "mutedSurface"],
    ["--surface-elevated-foreground", "elevatedForeground"],
    ["--interactive-active", "active"],
    ["--interactive-selection-foreground", "selectionForeground"],
    ["--primary-foreground", "primaryForeground"],
    ["--primary-text", "primaryText"],
    ["--success-text", "successText"],
    ["--warning-text", "warningText"],
    ["--error-text", "errorText"],
    ["--info-text", "infoText"],
    ["--status-success", "success"],
    ["--status-warning", "warning"],
    ["--status-error", "error"],
    ["--status-info", "info"],
    ["--font-sans", "font"],
    ["--font-mono", "mono"],
    ["--radius", "radius"]
  ];
  var SYNTAX_TOKEN_VARS = [
    ["--oc-syntax-keyword", "--syntax-keyword", "syntaxKeyword"],
    ["--oc-syntax-string", "--syntax-string", "syntaxString"],
    ["--oc-syntax-number", "--syntax-number", "syntaxNumber"],
    ["--oc-syntax-function", "--syntax-function", "syntaxFunction"],
    ["--oc-syntax-type", "--syntax-type", "syntaxType"],
    ["--oc-syntax-comment", "--syntax-comment", "syntaxComment"],
    ["--oc-syntax-variable", "--syntax-variable", "syntaxVariable"],
    ["--oc-syntax-operator", "--syntax-operator", "syntaxOperator"]
  ];
  var applyHostTheme = (theme, root) => {
    root.style.colorScheme = theme.mode;
    for (const [name, key] of TOKEN_VARS) {
      root.style.setProperty(name, theme.tokens[key]);
    }
    for (const [alias, hostName, key] of SYNTAX_TOKEN_VARS) {
      const value = theme.tokens[key] ?? "";
      root.style.setProperty(alias, value);
      root.style.setProperty(hostName, value);
    }
    root.style.setProperty("font-family", theme.tokens.font);
    root.style.setProperty("font-size", "0.875rem");
    root.style.setProperty("line-height", "1.45");
    root.style.setProperty("color", theme.tokens.foreground);
  };
  var applyHostReady = (ctx2, root) => {
    applyHostTheme(ctx2.theme, root);
    if (root.dataset) {
      root.dataset.ocSurface = ctx2.surface;
      root.dataset.ocTheme = ctx2.theme.mode;
    }
  };

  // node_modules/@openchamber/sdk/dist/ui/style.js
  var OC_ALIAS = {
    "surface-background": "bg",
    "surface-elevated": "elevated",
    "surface-elevated-foreground": "elevated-fg",
    "surface-foreground": "fg",
    "surface-muted-foreground": "muted",
    "surface-muted": "muted-surface",
    "surface-subtle": "subtle",
    "interactive-border": "border",
    "interactive-hover": "hover",
    "interactive-active": "active",
    "interactive-selection": "selection",
    "interactive-selection-foreground": "selection-fg",
    "interactive-focus-ring": "focus",
    "primary": "primary",
    "primary-foreground": "primary-fg",
    "primary-text": "primary-text",
    "success-text": "success-text",
    "warning-text": "warning-text",
    "error-text": "error-text",
    "info-text": "info-text",
    "status-success": "success",
    "status-warning": "warning",
    "status-error": "error",
    "status-info": "info",
    "font-sans": "font",
    "font-mono": "mono",
    "radius": "radius"
  };
  var v = (name, fallback) => `var(--${name}, var(--oc-${OC_ALIAS[name]}, ${fallback}))`;
  var bg = v("surface-background", "transparent");
  var elevated = v("surface-elevated", "transparent");
  var elevatedFg = v("surface-elevated-foreground", "inherit");
  var fg = v("surface-foreground", "inherit");
  var muted = v("surface-muted-foreground", "gray");
  var secondary = v("surface-muted", "transparent");
  var border = v("interactive-border", "currentColor");
  var hover = v("interactive-hover", "transparent");
  var active = v("interactive-active", "transparent");
  var selection = v("interactive-selection", "transparent");
  var selectionFg = v("interactive-selection-foreground", "inherit");
  var primary = v("primary", "currentColor");
  var primaryText = v("primary-text", "inherit");
  var errorText = v("error-text", "inherit");
  var font = v("font-sans", "inherit");
  var mono = v("font-mono", "monospace");
  var radius = v("radius", "9px");
  var controlRadius = `calc(${radius} - 2px)`;
  var smallRadius = `calc(${radius} - 4px)`;
  var mix = (color, pct, base = "transparent") => `color-mix(in srgb, ${color} ${pct}%, ${base})`;
  var focusFill = `background-image: linear-gradient(${hover}, ${hover});`;
  var field = (edge, width = "0.5px") => `box-shadow: inset 0 0 0 ${width} ${edge}, var(--oc-sdk-field-lift);`;
  var raised = "border-color: var(--oc-sdk-edge); box-shadow: var(--oc-sdk-raised-lift);";
  var litButton = "box-shadow: var(--oc-sdk-lit);";
  var darkLift = `inset 0 0.5px 0 0 ${mix(fg, 8)}, 0 1px 2px 0 rgb(0 0 0 / 0.4)`;
  var THEME_VARS = `
:root {
  --oc-sdk-edge: ${mix(fg, 16)};
  --oc-sdk-field-bg: ${elevated};
  --oc-sdk-raised-bg: ${bg};
  --oc-sdk-field-lift: inset 0 1px 2px 0 rgb(0 0 0 / 0.04);
  --oc-sdk-raised-lift: 0 1px 1.5px 0 rgb(0 0 0 / 0.08);
  --oc-sdk-lit: inset 0 1px 0 0 rgb(255 255 255 / 0.2), 0 1px 1.5px 0 rgb(0 0 0 / 0.1);
  --oc-sdk-float-edge: rgb(0 0 0 / 0.14);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.7), 0 1px 2px -0.5px rgb(0 0 0 / 0.06), 0 4px 8px -2px rgb(0 0 0 / 0.08), 0 12px 20px -4px rgb(0 0 0 / 0.06);
}
:root[data-oc-theme="dark"] {
  --oc-sdk-edge: ${mix(fg, 14)};
  --oc-sdk-field-bg: ${mix(bg, 50, elevated)};
  --oc-sdk-raised-bg: ${elevated};
  --oc-sdk-field-lift: ${darkLift};
  --oc-sdk-raised-lift: ${darkLift};
  --oc-sdk-lit: ${darkLift};
  --oc-sdk-float-edge: rgb(0 0 0 / 0.55);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.04), inset 0 0 0 0.5px rgb(255 255 255 / 0.08), 0 8px 16px 0 rgb(0 0 0 / 0.25), 0 4px 8px 0 rgb(0 0 0 / 0.25);
}`;
  var tone = (name) => {
    const color = v(`status-${name}`, "currentColor");
    return `
.oc-sdk[data-tone="${name}"], .oc-sdk [data-tone="${name}"] { --oc-sdk-tone: ${color}; --oc-sdk-tone-text: ${v(`${name}-text`, "inherit")}; }`;
  };
  var UI_SIZE_CSS = `
.oc-sdk { box-sizing: border-box; font-size: 0.875rem; line-height: 1.45; }
.oc-sdk *, .oc-sdk *::before, .oc-sdk *::after { box-sizing: border-box; }
/* :where() keeps the reset at zero specificity so every primitive class below overrides it. */
:where(.oc-sdk) :where(button, input, textarea), :where(button.oc-sdk, input.oc-sdk, textarea.oc-sdk) { font: inherit; color: inherit; margin: 0; }
:where(.oc-sdk) :where(button), :where(button.oc-sdk) { cursor: pointer; background: none; border: 0; padding: 0; }
.oc-sdk button:disabled, button.oc-sdk:disabled, .oc-sdk[aria-disabled="true"], .oc-sdk [aria-disabled="true"] { opacity: .5; pointer-events: none; }

.oc-sdk-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 32px; padding: 0 12px; border: 1px solid transparent; font-size: 0.875rem; font-weight: 500; line-height: 1; white-space: nowrap; }
.oc-sdk-btn[data-size="sm"] { gap: 6px; height: 28px; padding: 0 10px; font-size: 0.8125rem; }
.oc-sdk-btn[data-size="xs"] { gap: 4px; height: 24px; padding: 0 8px; font-size: 0.75rem; }
.oc-sdk-btn[data-loading="true"] { opacity: .5; pointer-events: none; }
.oc-sdk-btn > .oc-sdk-spinner-ring { width: 14px; height: 14px; }

.oc-sdk-field { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.oc-sdk-field-label { font-size: 0.8125rem; font-weight: 500; }
.oc-sdk-field-note { font-size: 0.75rem; }
.oc-sdk-input { display: block; width: 100%; min-width: 0; height: 32px; padding: 0 10px; border: 0; font-size: 0.875rem; line-height: 1.45; appearance: none; }
textarea.oc-sdk-input { height: auto; padding: 8px 10px; resize: vertical; }

.oc-sdk-search { position: relative; min-width: 0; }
.oc-sdk-search .oc-sdk-input { padding-left: 34px; padding-right: 34px; }
.oc-sdk-search-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); pointer-events: none; }
.oc-sdk-search-clear { position: absolute; right: 6px; top: 50%; transform: translateY(-50%); display: none; align-items: center; justify-content: center; width: 24px; height: 24px; }
.oc-sdk-search[data-active="true"] .oc-sdk-search-clear { display: inline-flex; }

.oc-sdk-select { position: relative; display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.oc-sdk-trigger { display: inline-flex; align-items: center; gap: 6px; align-self: flex-start; width: auto; max-width: 100%; min-width: 0; height: 28px; padding: 0 10px; border: 1px solid transparent; font-size: 0.8125rem; text-align: left; }
.oc-sdk-trigger-value { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.oc-sdk-trigger-chevron { flex: 0 0 auto; }
.oc-sdk-popup { position: fixed; z-index: 50; display: flex; flex-direction: column; gap: 2px; min-width: 160px; max-width: calc(100vw - 16px); max-height: min(320px, calc(100vh - 16px)); overflow: auto; padding: 4px; border: 1px solid transparent; }
.oc-sdk-popup-search { flex: 0 0 auto; padding: 2px 2px 4px; }
.oc-sdk-popup-search .oc-sdk-input { height: 28px; font-size: 0.8125rem; }
.oc-sdk-option { display: flex; align-items: center; gap: 8px; width: 100%; padding: 6px 8px; font-size: 0.8125rem; text-align: left; }
.oc-sdk-option-label { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.oc-sdk-option-hint { flex: 0 0 auto; font-size: 0.75rem; }
.oc-sdk-option-check { flex: 0 0 auto; display: inline-flex; width: 14px; visibility: hidden; }
.oc-sdk-option[aria-selected="true"] > .oc-sdk-option-check { visibility: visible; }
.oc-sdk-popup-empty { padding: 8px; font-size: 0.8125rem; }

.oc-sdk-check { display: inline-flex; align-items: flex-start; gap: 8px; width: 100%; text-align: left; }
.oc-sdk-check-box { flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center; width: 14px; height: 14px; margin-top: 3px; border: 1px solid transparent; }
.oc-sdk-check-box > svg { display: none; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-box > svg { display: block; }
.oc-sdk-check-thumb { flex: 0 0 auto; position: relative; width: 36px; height: 20px; }
.oc-sdk-check-thumb::after { content: ""; position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; }
.oc-sdk-check-text { display: flex; flex-direction: column; min-width: 0; }
.oc-sdk-check-label { font-size: 0.875rem; }
.oc-sdk-check-desc { font-size: 0.75rem; }

.oc-sdk-tabs { display: inline-flex; gap: 2px; padding: 2px; max-width: 100%; overflow: auto; }
.oc-sdk-tab { display: inline-flex; align-items: center; gap: 6px; height: 28px; padding: 0 10px; border: 1px solid transparent; font-size: 0.8125rem; font-weight: 500; white-space: nowrap; }
.oc-sdk-tab-count { font-size: 0.75rem; font-variant-numeric: tabular-nums; }

.oc-sdk-badge { display: inline-flex; align-items: center; padding: 1px 6px; font-size: 11px; font-weight: 500; line-height: 16px; white-space: nowrap; }

.oc-sdk-list { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.oc-sdk-row { display: flex; align-items: center; gap: 8px; width: 100%; padding: 6px 8px; text-align: left; }
.oc-sdk-row-lead { flex: 0 0 auto; width: 64px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.75rem; }
.oc-sdk-row-main { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; }
.oc-sdk-row-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.oc-sdk-row-sub { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.75rem; }
.oc-sdk-row-meta { flex: 0 0 auto; font-size: 0.75rem; font-variant-numeric: tabular-nums; }
.oc-sdk-list-empty { padding: 16px 8px; text-align: center; font-size: 0.8125rem; }

.oc-sdk-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; padding: 40px 16px; text-align: center; }
.oc-sdk-empty-title { margin: 0; font-size: 0.8125rem; font-weight: 600; }
.oc-sdk-empty-body { margin: 0; max-width: 32rem; font-size: 0.8125rem; }
.oc-sdk-empty-action { margin-top: 12px; }

@keyframes oc-sdk-spin { to { transform: rotate(360deg); } }
.oc-sdk-spinner { display: inline-flex; align-items: center; gap: 8px; font-size: 0.8125rem; }
.oc-sdk-spinner-ring { width: 16px; height: 16px; border: 2px solid transparent; animation: oc-sdk-spin .8s linear infinite; }
.oc-sdk-spinner[data-size="sm"] .oc-sdk-spinner-ring { width: 12px; height: 12px; }

.oc-sdk-banner { display: flex; align-items: flex-start; gap: 12px; padding: 8px 12px; border: 1px solid transparent; }
.oc-sdk-banner-text { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.oc-sdk-banner-title { font-size: 0.8125rem; font-weight: 500; }
.oc-sdk-banner-body { font-size: 0.8125rem; }
.oc-sdk-banner-action { flex: 0 0 auto; }

.oc-sdk-separator { display: flex; align-items: center; gap: 8px; width: 100%; margin: 8px 0; font-size: 0.75rem; }
.oc-sdk-separator::before, .oc-sdk-separator::after { content: ""; flex: 1 1 auto; height: 1px; }
.oc-sdk-separator[data-labeled="false"]::after { display: none; }
.oc-sdk-popup > .oc-sdk-separator { margin: 4px 0; }

.oc-sdk-progress { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.oc-sdk-progress-label { display: flex; justify-content: space-between; font-size: 0.75rem; font-variant-numeric: tabular-nums; }
.oc-sdk-progress-track { height: 6px; overflow: hidden; }
.oc-sdk-progress-fill { height: 100%; transform-origin: left; transition: transform 200ms ease-out; }
.oc-sdk-progress-value { display: inline-flex; align-items: center; gap: 2px; }
.oc-sdk-progress[data-done="true"] .oc-sdk-progress-value { font-weight: 600; }

.oc-sdk-menu { position: relative; display: inline-flex; }

.oc-sdk-text { white-space: pre-wrap; overflow-wrap: anywhere; }
.oc-sdk-text img { display: block; max-width: 100%; margin: 8px 0; }
`;
  var GUEST_UI_LOOK_CSS = `${THEME_VARS}
.oc-sdk { color: ${fg}; font-family: ${font}; }
.oc-sdk :focus-visible, .oc-sdk:focus-visible { outline: none; }
.oc-sdk :where(button, a[href], [role="button"], [role="tab"], [role="option"]):focus-visible, button.oc-sdk:focus-visible { ${focusFill} }
.oc-sdk-mono { font-family: ${mono}; }
.oc-sdk-muted { color: ${muted}; }
${tone("success")}${tone("warning")}${tone("error")}${tone("info")}
.oc-sdk[data-tone="primary"], .oc-sdk [data-tone="primary"] { --oc-sdk-tone: ${primary}; --oc-sdk-tone-text: ${primaryText}; }

.oc-sdk-btn { border-radius: ${controlRadius}; transition: background 150ms ease-out, color 150ms ease-out; }
.oc-sdk-btn[data-size="xs"] { border-radius: ${smallRadius}; }
.oc-sdk-btn[data-variant="default"] { color: ${primaryText}; background: ${mix(primary, 10, bg)}; border-color: ${mix(primary, 12)}; ${litButton} }
.oc-sdk-btn[data-variant="default"]:hover { background: ${mix(primary, 16, bg)}; }
.oc-sdk-btn[data-variant="default"]:active { background: ${mix(primary, 22, bg)}; box-shadow: none; }
.oc-sdk-btn[data-variant="secondary"] { background: ${secondary}; color: var(--oc-fg); }
.oc-sdk-btn[data-variant="secondary"]:hover { background-image: linear-gradient(${hover}, ${hover}); }
.oc-sdk-btn[data-variant="secondary"]:active { background-image: linear-gradient(${active}, ${active}); }
.oc-sdk-btn[data-variant="outline"] { background: var(--oc-sdk-raised-bg); color: ${elevatedFg}; ${raised} }
.oc-sdk-btn[data-variant="outline"]:hover { background-image: linear-gradient(${hover}, ${hover}); }
.oc-sdk-btn[data-variant="outline"]:active { background-image: linear-gradient(${active}, ${active}); box-shadow: none; }
.oc-sdk-btn[data-variant="ghost"] { background: transparent; }
.oc-sdk-btn[data-variant="ghost"]:hover { background: ${hover}; }
.oc-sdk-btn[data-variant="ghost"]:active { background: ${active}; }
.oc-sdk-btn[data-variant="destructive"] { --oc-sdk-tone: ${v("status-error", "red")}; color: ${errorText}; background: ${mix("var(--oc-sdk-tone)", 7, bg)}; border-color: ${mix("var(--oc-sdk-tone)", 12)}; ${litButton} }
.oc-sdk-btn[data-variant="destructive"]:hover { background: ${mix("var(--oc-sdk-tone)", 9, bg)}; }
.oc-sdk-btn[data-variant="destructive"]:active { background: ${mix("var(--oc-sdk-tone)", 11, bg)}; box-shadow: none; }

.oc-sdk-field-note { color: ${muted}; }
.oc-sdk-field[data-invalid="true"] .oc-sdk-field-note { color: ${errorText}; }
.oc-sdk-input { border-radius: ${controlRadius}; background: var(--oc-sdk-field-bg); color: ${elevatedFg}; ${field("var(--oc-sdk-edge)")} transition: background 150ms ease-out; }
.oc-sdk-input::placeholder { color: ${muted}; }
.oc-sdk-input:hover:not(:focus) { background-image: linear-gradient(${hover}, ${hover}); }
.oc-sdk-input:focus, .oc-sdk-input:focus-visible { ${field(mix(fg, 26), "1px")} }
.oc-sdk-field[data-invalid="true"] .oc-sdk-input, .oc-sdk-field[data-invalid="true"] .oc-sdk-input:focus { ${field(v("status-error", "red"), "1px")} }
.oc-sdk-input[data-mono="true"] { font-family: ${mono}; }

.oc-sdk-search-icon { color: ${muted}; }
.oc-sdk-search[data-active="true"] .oc-sdk-search-icon { color: ${primary}; }
.oc-sdk-search-clear { border-radius: ${smallRadius}; color: ${muted}; }
.oc-sdk-search-clear:hover { background: ${hover}; color: ${fg}; }

.oc-sdk-trigger { border-radius: ${controlRadius}; background: var(--oc-sdk-raised-bg); color: ${elevatedFg}; ${raised} transition: background 150ms ease-out; }
.oc-sdk-trigger:hover { background-image: linear-gradient(${hover}, ${hover}); }
.oc-sdk-trigger[aria-expanded="true"] { background-image: linear-gradient(${active}, ${active}); }
.oc-sdk-trigger-value[data-empty="true"] { color: ${muted}; }
.oc-sdk-trigger-chevron { color: ${muted}; }
/* The app's floating level: the glass edge (a hairline ring and a lit top line, dark outside and light inside in dark themes) over soft shadows. The outer ring is the border, over the page like the app's. */
.oc-sdk-popup { --surface-foreground: ${elevatedFg}; border-color: var(--oc-sdk-float-edge); border-radius: 12px; background: ${elevated}; background-clip: padding-box; color: ${elevatedFg}; box-shadow: var(--oc-sdk-float); }
.oc-sdk-option { border-radius: 8px; }
.oc-sdk-option[data-active="true"] { background: ${hover}; }
/* A selected option shows a check mark in the text colour, like the app's own pickers. Options without the mark come
   from bundles built before it existed and keep the selection fill as their only sign of the choice. */
.oc-sdk-option[aria-selected="true"]:not([data-mark]) { background: ${selection}; color: ${selectionFg}; }
.oc-sdk-option-check { color: ${fg}; }
.oc-sdk-option[data-destructive="true"] { color: ${errorText}; }
.oc-sdk-option[data-destructive="true"][data-active="true"] { background: ${mix(v("status-error", "red"), 10)}; }
.oc-sdk-option-hint { color: ${muted}; }
.oc-sdk-popup-empty { color: ${muted}; }

/* Checked stays neutral: the mark carries the state, and the primary colour stays with primary actions. */
.oc-sdk-check-box { border-color: ${border}; border-radius: 4px; color: ${fg}; transition: border-color 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-box { border-color: ${mix(fg, 60, border)}; }
.oc-sdk-check-thumb { border-radius: 9999px; background: ${border}; transition: background 150ms ease-out; }
.oc-sdk-check-thumb::after { border-radius: 9999px; background: ${bg}; transition: transform 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb { background: ${primary}; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb::after { transform: translateX(16px); }
.oc-sdk-check:focus-visible { box-shadow: none; }
.oc-sdk-check:focus-visible .oc-sdk-check-box, .oc-sdk-check:focus-visible .oc-sdk-check-thumb { ${focusFill} }
.oc-sdk-check-desc { color: ${muted}; }

.oc-sdk-tabs { border-radius: 10px; }
.oc-sdk-tabs[data-track="true"] { background: ${mix(fg, 4)}; box-shadow: inset 0 1px 2px 0 rgb(0 0 0 / 0.16); }
.oc-sdk-tab { border-radius: 8px; color: ${muted}; transition: color 150ms ease-out, background 150ms ease-out; }
.oc-sdk-tab:hover { color: ${fg}; }
.oc-sdk-tab[aria-selected="true"] { color: ${selectionFg}; background: ${selection}; border-color: ${border}; }
.oc-sdk-tabs[data-track="true"] .oc-sdk-tab[aria-selected="true"] { color: ${elevatedFg}; background: var(--oc-sdk-raised-bg); ${raised} }
.oc-sdk-tab-count { color: ${muted}; }

/* The app's neutral badge: a step of the text colour, the same in every theme. */
.oc-sdk-badge { border-radius: 9999px; background: ${mix(fg, 6)}; color: ${muted}; }
.oc-sdk-badge[data-tone] { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); background: ${mix("var(--oc-sdk-tone)", 15)}; }

.oc-sdk-row { border-radius: 6px; transition: background 120ms ease-out; }
.oc-sdk-row:hover, .oc-sdk-row[data-active="true"] { background: ${hover}; }
.oc-sdk-row[aria-selected="true"] { background: ${selection}; color: ${selectionFg}; }
.oc-sdk-row-lead { font-family: ${mono}; color: ${muted}; }
.oc-sdk-row-sub { color: ${muted}; }
.oc-sdk-row-meta { color: ${muted}; }
.oc-sdk-row[aria-selected="true"] .oc-sdk-row-lead, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-sub, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-meta { color: inherit; opacity: .75; }
.oc-sdk-list-empty { color: ${muted}; }

.oc-sdk-empty-body { color: ${muted}; }

.oc-sdk-spinner { color: ${muted}; }
.oc-sdk-spinner-ring { border-color: ${border}; border-top-color: ${primary}; border-radius: 9999px; }

/* Set apart by its tint alone, like the app's banners. */
.oc-sdk-banner { border-color: transparent; border-radius: 8px; background: ${mix("var(--oc-sdk-tone)", 10)}; }
.oc-sdk-banner-title { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); }
.oc-sdk-banner-body { color: ${muted}; }

.oc-sdk-separator { color: ${muted}; }
.oc-sdk-separator::before, .oc-sdk-separator::after { background: ${mix(border, 40)}; }

.oc-sdk-progress-label { color: ${muted}; }
/* The app's progress: a groove a step of the text colour, green once done. Older bundles mark done only through aria-valuenow. */
.oc-sdk-progress-track { border-radius: 9999px; background: ${mix(fg, 6)}; }
.oc-sdk-progress-fill { border-radius: 9999px; background: var(--oc-sdk-tone, ${primary}); }
.oc-sdk-progress-track[aria-valuenow="100"] > .oc-sdk-progress-fill:not([data-tone]) { background: ${v("status-success", "currentColor")}; }
.oc-sdk-progress[data-done="true"] .oc-sdk-progress-value { color: ${v("success-text", "inherit")}; }

.oc-sdk-text a { color: ${primaryText}; text-decoration: underline; text-underline-offset: 2px; }
.oc-sdk-text img { border-radius: 8px; border: 1px solid ${mix(border, 60)}; }
`;
  var UI_CSS = `
${GUEST_SCROLLBAR_CSS}
${UI_SIZE_CSS}
${GUEST_UI_LOOK_CSS}`;

  // src/main.js
  var host = connectHost();
  var TAU = Math.PI * 2;
  var C = {
    void: "#05070b",
    bone: "#e9e5d8",
    dim: "rgba(233, 229, 216, 0.42)",
    heat: "#ffb45e",
    hot: "#ffc98a",
    cold: "#86d9ff",
    hurt: "#ff5f6d"
  };
  var WORLD_H = 780;
  var BEST_KEY = "bullet-rain:best";
  var BEST_WAVE_KEY = "bullet-rain:wave";
  var LIVES = 3;
  var PARAMS = new URLSearchParams(window.location.search);
  var AUTOPILOT = PARAMS.has("auto");
  var SPEED = Math.max(1, Math.min(10, Number(PARAMS.get("speed")) || 1));
  var START_WAVE = Math.max(1, Math.min(20, Number(PARAMS.get("wave")) || 1));
  var DEBUG_WAVE = PARAMS.has("wave");
  var SIM = Math.max(1, Math.min(900, Number(PARAMS.get("sim")) || 1));
  var TIMERS = PARAMS.has("timers");
  var DBG = PARAMS.has("dbg");
  var STEPS = Math.max(0, Math.min(2e5, Number(PARAMS.get("steps")) || 0));
  var GOD = PARAMS.has("god");
  var clamp = (v2, min, max) => Math.max(min, Math.min(max, v2));
  var rand = (min, max) => min + Math.random() * (max - min);
  function hexToRgb(hex) {
    const v2 = parseInt(hex.slice(1), 16);
    return [v2 >> 16 & 255, v2 >> 8 & 255, v2 & 255];
  }
  function tint(hex, a) {
    const [r, g, b] = hexToRgb(hex);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
  var rgba = (hue, a) => `rgba(${hue[0]}, ${hue[1]}, ${hue[2]}, ${a})`;
  var $ = (id) => document.getElementById(id);
  var stage = $("stage");
  var canvas = $("play");
  var ctx = canvas.getContext("2d", { alpha: false });
  var scoreEl = $("score");
  var bestEl = $("best");
  var chainEl = $("chain");
  var livesEl = $("lives");
  var waveEl = $("wave");
  var grazeEl = $("graze");
  var powerEl = $("power");
  var buffsEl = $("buffs");
  var hpEl = $("hp");
  var hpNum = $("hp-num");
  var meterRate = $("meter-rate");
  var meterDmg = $("meter-dmg");
  var meterStream = $("meter-stream");
  var pickFill = $("pick-fill");
  var pickNum = $("pick-num");
  var bossbar = $("bossbar");
  var bossname = $("bossname");
  var bosshp = $("bosshp");
  var gate = $("gate");
  var gateKicker = $("gate-kicker");
  var gateTitle = $("gate-title");
  var gateText = $("gate-text");
  var gateActions = $("gate-actions");
  var upgradeEl = $("upgrade");
  var upgradeOptions = $("up-options");
  var upKicker = $("up-kicker");
  var loadingEl = $("loading");
  var pauseBtn = $("pause");
  var soundBtn = $("sound");
  var tipEl = $("tip");
  if (DBG) {
    const report = (text) => {
      let box = document.getElementById("err");
      if (!box) {
        box = document.createElement("pre");
        box.id = "err";
        box.style.cssText = "position:fixed;left:0;right:0;bottom:0;z-index:99;margin:0;padding:8px;background:#300;color:#fff;font:12px monospace;white-space:pre-wrap";
        document.body.append(box);
      }
      box.textContent += `${text}
`;
    };
    window.addEventListener("error", (event) => report(`ERR ${event.message} @ ${event.filename}:${event.lineno}`));
    window.addEventListener("unhandledrejection", (event) => report(`REJ ${String(event.reason)}`));
    window.__report = report;
  }
  var best = readLocalBest();
  function readLocalBest() {
    try {
      const raw = window.localStorage.getItem(BEST_KEY);
      const value = raw ? Number(raw) : 0;
      return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
    } catch {
      return 0;
    }
  }
  function persistBest() {
    try {
      window.localStorage.setItem(BEST_KEY, String(best));
    } catch {
    }
    try {
      void host.storage.set(BEST_KEY, best).catch(() => void 0);
    } catch {
    }
  }
  async function loadBest() {
    try {
      const stored = await host.storage.get(BEST_KEY);
      if (typeof stored === "number" && Number.isFinite(stored) && stored > best) best = Math.floor(stored);
    } catch {
    }
    bestEl.textContent = format(best);
    if (state.mode === "menu") toMenu();
  }
  var bestWave = readLocalWave();
  function readLocalWave() {
    try {
      const raw = window.localStorage.getItem(BEST_WAVE_KEY);
      const value = raw ? Number(raw) : 1;
      return Number.isFinite(value) && value >= 1 ? Math.floor(value) : 1;
    } catch {
      return 1;
    }
  }
  function persistWave() {
    try {
      window.localStorage.setItem(BEST_WAVE_KEY, String(bestWave));
    } catch {
    }
    try {
      void host.storage.set(BEST_WAVE_KEY, bestWave).catch(() => void 0);
    } catch {
    }
  }
  async function loadWave() {
    try {
      const stored = await host.storage.get(BEST_WAVE_KEY);
      if (typeof stored === "number" && Number.isFinite(stored) && stored > bestWave) bestWave = Math.floor(stored);
    } catch {
    }
    if (state.mode === "menu") toMenu();
  }
  function markWave(n) {
    if (DEBUG_WAVE || n <= bestWave) return;
    bestWave = n;
    persistWave();
  }
  var state = {
    mode: "menu",
    // menu | playing | paused | upgrade | over
    scale: 1,
    dpr: 1,
    w: 420,
    h: WORLD_H,
    time: 0,
    score: 0,
    chain: 1,
    chainTimer: 0,
    graze: 0,
    lives: LIVES,
    wave: 0,
    zone: 0,
    invuln: 0,
    shake: 0,
    flash: 0,
    slow: 0,
    banner: null,
    boss: null,
    waveBudget: 0,
    spawnTimer: 0,
    waveQuiet: 0,
    bossPending: false,
    pressure: 0.5,
    heavyCount: 0,
    splitCount: 0,
    wallCount: 0,
    packHistory: [],
    eliteCooldown: 2,
    fireTimer: 0,
    threats: 0,
    threatTimer: 0,
    shield: 0,
    buff: { over: 0, slow: 0 },
    up: { rate: 0, dmg: 0, stream: 0 },
    pickAt: 12e3,
    pickQueue: 0,
    pendingPick: false,
    tipShown: false,
    tipTimer: 0,
    runStartWave: 1,
    resizes: 0,
    draws: 0
  };
  var player = { x: 0, y: 0, r: 4.2, focus: false, alive: true };
  var keys = /* @__PURE__ */ new Set();
  var pointerDown = false;
  var moveTarget = { x: 0, y: 0 };
  var pointer = { x: 0, y: 0 };
  var enemies = [];
  var ebullets = [];
  var pbullets = [];
  var particles = [];
  var popups = [];
  var drops = [];
  var ZONES = [
    {
      name: "\u6DF1\u7A7A",
      code: "VOID",
      top: "#060810",
      mid: "#080c15",
      bottom: "#04060a",
      hue: [96, 132, 184],
      accent: "#86d9ff",
      dust: 0.14
    },
    {
      name: "\u4F59\u70EC",
      code: "EMBER",
      top: "#0a0605",
      mid: "#110907",
      bottom: "#050304",
      hue: [168, 88, 48],
      accent: "#ffb45e",
      dust: 0.18
    },
    {
      name: "\u51B0\u539F",
      code: "RIME",
      top: "#05080c",
      mid: "#0a1217",
      bottom: "#04070a",
      hue: [116, 172, 194],
      accent: "#d6f2f7",
      dust: 0.12
    },
    {
      name: "\u8D64\u6F6E",
      code: "BLOOM",
      top: "#0b0508",
      mid: "#160810",
      bottom: "#070306",
      hue: [186, 62, 96],
      accent: "#ff7d92",
      dust: 0.17
    }
  ];
  var backdrop = {
    zone: -1,
    scroll: 0,
    nebula: null,
    sky: null,
    vignette: null,
    stars: [],
    debris: [],
    dust: [],
    planet: null
  };
  function makeStars() {
    const count = Math.round(state.w * state.h / 4200);
    const stars = [];
    for (let i = 0; i < count; i += 1) {
      const depth = Math.random();
      stars.push({
        x: rand(0, state.w),
        y: rand(0, state.h),
        r: depth > 0.9 ? rand(1.3, 2.1) : rand(0.5, 1.1),
        v: 16 + depth * 82,
        a: 0.14 + depth * 0.55,
        layer: depth
      });
    }
    return stars;
  }
  function makeDebris(z) {
    const debris = [];
    const count = 9 + Math.round(state.w / 90);
    for (let i = 0; i < count; i += 1) {
      const pts = [];
      const n = 5 + Math.floor(Math.random() * 3);
      for (let k = 0; k < n; k += 1) {
        pts.push({ a: k / n * TAU + rand(-0.14, 0.14), d: rand(0.62, 1) });
      }
      debris.push({
        x: rand(0, state.w),
        y: rand(0, state.h),
        r: rand(6, 24),
        rot: rand(0, TAU),
        vr: rand(-0.5, 0.5),
        v: rand(12, 46),
        a: rand(0.1, 0.26),
        pts,
        accent: Math.random() < 0.3 ? z.accent : null
      });
    }
    return debris;
  }
  function makeDust(z) {
    const dust = [];
    const count = 12;
    for (let i = 0; i < count; i += 1) {
      dust.push({
        x: rand(0, state.w),
        y: rand(0, state.h),
        len: rand(8, 26),
        v: rand(360, 640),
        a: rand(0.06, z.dust)
      });
    }
    return dust;
  }
  function makePlanet(z) {
    return {
      x: rand(state.w * 0.12, state.w * 0.88),
      y: rand(-state.h * 0.5, -120),
      r: rand(state.w * 0.22, state.w * 0.36),
      v: rand(3, 7),
      tilt: rand(-0.5, 0.5),
      z
    };
  }
  function bakeNebula(z) {
    const w = Math.max(2, Math.round(state.w));
    const h = Math.max(2, Math.round(state.h));
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const g = c.getContext("2d");
    const blobs = 4 + Math.round(w / 90);
    for (let i = 0; i < blobs; i += 1) {
      const x = rand(-0.15, 1.15) * w;
      const y = rand(-0.1, 1.1) * h;
      const r = rand(80, 260) * (w / 420);
      const a1 = rand(0.045, 0.1);
      const a2 = rand(0.018, 0.04);
      for (const dy of [0, -h, h]) {
        const grad = g.createRadialGradient(x, y + dy, 0, x, y + dy, r);
        grad.addColorStop(0, rgba(z.hue, a1));
        grad.addColorStop(0.55, rgba(z.hue, a2));
        grad.addColorStop(1, rgba(z.hue, 0));
        g.fillStyle = grad;
        g.fillRect(x - r, y + dy - r, r * 2, r * 2);
      }
    }
    g.globalAlpha = 0.035;
    g.strokeStyle = z.accent;
    for (let i = 0; i < 3; i += 1) {
      const y0 = rand(0, h);
      const c1 = rand(0, h);
      const c2 = rand(0, h);
      const y1 = rand(0, h);
      g.lineWidth = rand(10, 40);
      for (const dy of [-h, 0, h]) {
        g.beginPath();
        g.moveTo(-40, y0 + dy);
        g.bezierCurveTo(w * 0.3, c1 + dy, w * 0.7, c2 + dy, w + 40, y1 + dy);
        g.stroke();
      }
    }
    g.globalAlpha = 1;
    return c;
  }
  function setZone(index, force = false) {
    if (!force && index === backdrop.zone) return;
    const z = ZONES[(index % ZONES.length + ZONES.length) % ZONES.length];
    backdrop.zone = index;
    state.zone = (index % ZONES.length + ZONES.length) % ZONES.length;
    backdrop.nebula = bakeNebula(z);
    backdrop.stars = makeStars();
    backdrop.debris = makeDebris(z);
    backdrop.dust = makeDust(z);
    backdrop.planet = makePlanet(z);
    backdrop.scroll = 0;
    state.zone = backdrop.zone % ZONES.length;
  }
  function zoneNow() {
    return ZONES[state.zone] || ZONES[0];
  }
  function buildSky() {
    const z = zoneNow();
    const grad = ctx.createLinearGradient(0, 0, 0, state.h);
    grad.addColorStop(0, z.top);
    grad.addColorStop(0.55, z.mid);
    grad.addColorStop(1, z.bottom);
    backdrop.sky = grad;
    const vg = ctx.createRadialGradient(state.w / 2, state.h * 0.46, state.h * 0.2, state.w / 2, state.h * 0.46, state.h * 0.78);
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, "rgba(0,0,0,0.5)");
    backdrop.vignette = vg;
  }
  function updateBackdrop(dt, rate) {
    for (const s of backdrop.stars) {
      s.y += s.v * dt * rate;
      if (s.y > state.h + 4) {
        s.y = -4;
        s.x = rand(0, state.w);
      }
    }
    for (const d of backdrop.debris) {
      d.y += d.v * dt * rate;
      d.rot += d.vr * dt * rate;
      if (d.y - d.r * 2 > state.h) {
        d.y = -d.r * 2;
        d.x = rand(0, state.w);
      }
    }
    for (const d of backdrop.dust) {
      d.y += d.v * dt * rate;
      if (d.y - d.len > state.h) {
        d.y = -d.len;
        d.x = rand(0, state.w);
      }
    }
    const p = backdrop.planet;
    if (p) {
      p.y += p.v * dt * rate;
      if (p.y - p.r * 2 > state.h) {
        p.y = -p.r * 2.4;
        p.x = rand(state.w * 0.1, state.w * 0.9);
        p.r = rand(state.w * 0.22, state.w * 0.36);
      }
    }
    backdrop.scroll += 24 * dt * rate;
  }
  function drawBackdrop() {
    const z = zoneNow();
    const w = state.w;
    const h = state.h;
    if (backdrop.sky) ctx.fillStyle = backdrop.sky;
    else ctx.fillStyle = C.void;
    ctx.fillRect(0, 0, w, h);
    for (const s of backdrop.stars) {
      ctx.globalAlpha = s.a;
      ctx.fillStyle = s.layer > 0.9 ? z.accent : C.bone;
      ctx.fillRect(s.x, s.y, s.r, s.r * (1.4 + s.layer));
    }
    ctx.globalAlpha = 1;
    if (backdrop.nebula) {
      const off = backdrop.scroll % h;
      ctx.globalAlpha = 0.92;
      ctx.drawImage(backdrop.nebula, 0, off - h, w, h);
      ctx.drawImage(backdrop.nebula, 0, off, w, h);
      ctx.globalAlpha = 1;
    }
    drawPlanet();
    drawLattice();
    for (const d of backdrop.debris) drawDebris(d);
    ctx.strokeStyle = z.accent;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (const d of backdrop.dust) {
      ctx.globalAlpha = d.a;
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x, d.y - d.len);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
    if (backdrop.vignette) {
      ctx.fillStyle = backdrop.vignette;
      ctx.fillRect(0, 0, w, h);
    }
  }
  function drawPlanet() {
    const p = backdrop.planet;
    if (!p) return;
    const z = p.z;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.tilt);
    ctx.fillStyle = "rgba(4, 6, 10, 0.86)";
    ctx.beginPath();
    ctx.arc(0, 0, p.r, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = rgba(z.hue, 0.34);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, p.r, 0, TAU);
    ctx.stroke();
    ctx.strokeStyle = rgba(z.hue, 0.14);
    ctx.beginPath();
    ctx.arc(0, 0, p.r * 0.86, 0, TAU);
    ctx.stroke();
    ctx.save();
    ctx.scale(1, 0.32);
    ctx.strokeStyle = rgba(z.hue, 0.24);
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(0, 0, p.r * 1.42, 0, TAU);
    ctx.stroke();
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.arc(0, 0, p.r * 1.62, 0, TAU);
    ctx.stroke();
    ctx.restore();
    ctx.fillStyle = rgba(z.hue, 0.09);
    ctx.beginPath();
    ctx.arc(-p.r * 0.34, p.r * 0.2, p.r * 0.22, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(p.r * 0.4, -p.r * 0.3, p.r * 0.13, 0, TAU);
    ctx.fill();
    ctx.restore();
  }
  function drawLattice() {
    const z = zoneNow();
    ctx.strokeStyle = rgba(z.hue, 0.07);
    ctx.lineWidth = 1;
    ctx.beginPath();
    const stepX = 54;
    for (let x = state.w % stepX / 2; x < state.w; x += stepX) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, state.h);
    }
    const stepY = 78;
    const off = backdrop.scroll * 0.55;
    for (let y = stepY - off % stepY; y < state.h; y += stepY) {
      ctx.moveTo(0, y);
      ctx.lineTo(state.w, y);
    }
    ctx.stroke();
  }
  function drawDebris(d) {
    ctx.save();
    ctx.translate(d.x, d.y);
    ctx.rotate(d.rot);
    ctx.beginPath();
    for (let i = 0; i < d.pts.length; i += 1) {
      const p = d.pts[i];
      const x = Math.cos(p.a) * d.r * p.d;
      const y = Math.sin(p.a) * d.r * p.d;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = "rgba(4, 6, 10, 0.55)";
    ctx.fill();
    ctx.strokeStyle = d.accent ? tint(d.accent, d.a * 2.2) : `rgba(233, 229, 216, ${d.a})`;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }
  var ENEMY = {
    drone: { tier: 1, r: 12, hp: 3, value: 1, color: "#8ea3c0" },
    rusher: { tier: 2, r: 13, hp: 5, value: 2, color: "#c9f25f" },
    inter: { tier: 3, r: 15, hp: 12, value: 4, color: "#f2efe4" },
    gun: { tier: 4, r: 17, hp: 16, value: 3, color: "#ffb45e" },
    hunter: { tier: 5, r: 21, hp: 24, value: 5, color: "#6fd8ff" },
    split: { tier: 6, r: 25, hp: 40, value: 7, color: "#c084ff" },
    fort: { tier: 7, r: 31, hp: 82, value: 12, color: "#ff4f63" }
  };
  var BOSSES = [
    { name: "\u68F1\u955C", code: "PRISM", color: "#86d9ff" },
    { name: "\u9488\u96E8", code: "NEEDLE", color: "#ffb45e" },
    { name: "\u6F29\u6DA1", code: "VORTEX", color: "#c78bff" }
  ];
  var hpScale = () => 1 + (state.wave - 1) * 0.22;
  var bulletSpeed = () => Math.min(310, 165 + state.wave * 8);
  var rank = () => 1 + Math.min(1.2, (state.wave - 1) * 0.075);
  function spawnEnemy(kind, x, y) {
    const spec = ENEMY[kind];
    const hp = spec.hp * hpScale();
    const e = {
      kind,
      tier: spec.tier,
      r: spec.r,
      color: spec.color,
      value: spec.value,
      x,
      y,
      hp,
      max: hp,
      t: 0,
      fire: rand(0.6, 1.2),
      burst: rand(0.4, 1),
      spin: rand(0, TAU),
      flash: 0,
      dead: false,
      leaving: false,
      phase: 0,
      shots: 0,
      charge: 0,
      aim: 0,
      vx: 0,
      vy: 0,
      free: null,
      stopY: rand(120, 230),
      amp: rand(16, 40),
      drift: rand(0.5, 1),
      seed: rand(0, TAU),
      cx: x,
      span: Math.min(state.w * 0.3, 150)
    };
    e.cx = clamp(x, e.span + e.r, state.w - e.span - e.r);
    enemies.push(e);
    return e;
  }
  function spawnBoss() {
    const variant = ((Math.floor(state.wave / 4) - 1) % 3 + 3) % 3;
    const spec = BOSSES[variant];
    const hp = 320 + state.wave * 46 + state.wave * state.wave * 6;
    const e = {
      kind: "boss",
      tier: 8,
      variant,
      r: 48,
      color: spec.color,
      value: 18,
      x: state.w / 2,
      y: -90,
      hp,
      max: hp,
      t: 0,
      fire: 0,
      burst: 0,
      spin: rand(0, TAU),
      pattern: -1,
      patternT: 0.8,
      windup: 0,
      cont: null,
      phase: 1,
      flash: 0,
      dead: false,
      entered: false,
      leaving: false,
      stopY: 142
    };
    enemies.push(e);
    state.boss = e;
    bossname.textContent = `${spec.name} \xB7 ${spec.code} ${String(state.wave).padStart(2, "0")}`;
    bossbar.hidden = false;
    bosshp.style.width = "100%";
    spawnEnemy("drone", state.w * 0.2, -50);
    spawnEnemy("drone", state.w * 0.8, -70);
    state.banner = { text: "WARNING", sub: spec.name, life: 1.8, max: 1.8 };
  }
  function closestApproach(x, y, vx, vy) {
    const dx = player.x - x;
    const dy = player.y - y;
    const v2 = vx * vx + vy * vy;
    if (v2 < 1) return null;
    const t = -(dx * vx + dy * vy) / v2;
    if (t <= 0) return null;
    const cx = x + vx * t;
    const cy = y + vy * t;
    return { t, d: Math.hypot(player.x - cx, player.y - cy) };
  }
  var angDiff = (a, b) => Math.abs(((a - b + Math.PI) % TAU + TAU) % TAU - Math.PI);
  function shoot(x, y, angle, speed, kind = "orb") {
    if (state.mode !== "playing") return;
    if (Math.hypot(x - player.x, y - player.y) < 56) return;
    if (ebullets.length > 420) return;
    let vx = Math.cos(angle) * speed;
    let vy = Math.sin(angle) * speed;
    let hit = closestApproach(x, y, vx, vy);
    if (hit && hit.t < 0.6) {
      const k = hit.t / 0.6;
      vx *= k;
      vy *= k;
      hit = closestApproach(x, y, vx, vy);
    }
    if (hit && hit.d < 9 && hit.t < 1.6) {
      if (state.threats >= 2) {
        const bent = angle + (Math.random() < 0.5 ? -1 : 1) * rand(0.12, 0.2);
        const mag = Math.hypot(vx, vy) || speed;
        vx = Math.cos(bent) * mag;
        vy = Math.sin(bent) * mag;
      } else {
        state.threats += 1;
      }
    }
    const r = kind === "needle" ? 5 : kind === "big" ? 9 : 6.4;
    ebullets.push({ x, y, vx, vy, angle, r, kind, grazed: false });
  }
  var shootOrb = (x, y, a, s) => shoot(x, y, a, s, "orb");
  var shootNeedle = (x, y, a, s) => shoot(x, y, a, s, "needle");
  function fireRing(x, y, count, speed, offset, gap = 0.55) {
    const dist = Math.hypot(player.x - x, player.y - y);
    const maxCount = Math.max(10, Math.floor(TAU * Math.max(dist, 120) / 34));
    const n = Math.max(8, Math.min(count, maxCount));
    const door = offset + rand(0, TAU);
    for (let i = 0; i < n; i += 1) {
      const a = offset + i / n * TAU;
      if (angDiff(a, door) < gap / 2) continue;
      shoot(x, y, a, speed, "orb");
    }
  }
  function fireFan(x, y, count, spread, speed, kind = "orb", jitter = 0.05, center = null) {
    const dist = Math.hypot(player.x - x, player.y - y);
    const maxCount = Math.max(3, Math.floor(spread * Math.max(dist, 120) / 30) + 1);
    const n = Math.max(3, Math.min(count, maxCount));
    const a0 = (center === null ? aimAt(x, y) : center) + rand(-jitter, jitter);
    const step = n > 1 ? spread / (n - 1) : 0;
    for (let i = 0; i < n; i += 1) {
      shoot(x, y, a0 + (i - (n - 1) / 2) * step, speed, kind);
    }
  }
  function aimAt(x, y) {
    return Math.atan2(player.y - y, player.x - x);
  }
  function bossVolley(e) {
    const speed = bulletSpeed();
    const heavy = e.phase >= 2;
    const v2 = e.variant;
    e.cont = null;
    if (v2 === 0) {
      if (e.pattern === 0) {
        fireRing(e.x, e.y, heavy ? 24 : 20, speed * 0.6, e.spin, 0.75);
        e.spin += 0.19;
      } else if (e.pattern === 1) {
        fireFan(e.x, e.y, heavy ? 8 : 6, 0.75, speed * 1.12, "needle", 0.04);
      } else if (e.pattern === 2) {
        e.cont = { kind: "spiral", timer: 2.6, every: 0.11, tick: 0, arms: heavy ? 3 : 2, angle: rand(0, TAU) };
      } else {
        for (let k = 0; k < 4; k += 1) {
          fireFan(e.x, e.y, 5, 0.5, speed * 0.5, "orb", 0.03, k * Math.PI / 2 + e.t * 0.25);
        }
      }
    } else if (v2 === 1) {
      if (e.pattern === 0) {
        e.cont = { kind: "sweep", timer: 2.2, every: 0.11, tick: 0, spread: -0.7, dir: 1 };
      } else if (e.pattern === 1) {
        for (let k = 0; k < 2; k += 1) {
          fireFan(e.x, e.y, 3, 0.28, speed * (1 + k * 0.06), "needle", 0.03);
        }
      } else if (e.pattern === 2) {
        e.cont = { kind: "ring", timer: 2.2, every: 0.3, tick: 0, angle: rand(0, TAU) };
      } else {
        e.cont = { kind: "curtain", timer: 2.4, every: 0.55, tick: 0, lane: 2 };
      }
    } else {
      if (e.pattern === 0) {
        e.cont = { kind: "spiral", timer: 2.8, every: 0.11, tick: 0, arms: heavy ? 3 : 2, angle: rand(0, TAU) };
      } else if (e.pattern === 1) {
        fireRing(e.x, e.y, heavy ? 22 : 18, speed * 0.52, e.spin, 0.75);
        e.spin += 0.23;
        fireFan(e.x, e.y, 5, 0.45, speed * 0.95, "needle", 0.04);
      } else if (e.pattern === 2) {
        e.cont = { kind: "wall", timer: 2.4, every: 0.26, tick: 0, side: 1 };
      } else {
        fireRing(e.x, e.y, 12, speed * 0.38, rand(0, TAU), 1);
      }
    }
  }
  function bossCont(e, dt) {
    const c = e.cont;
    if (!c) return;
    const speed = bulletSpeed();
    c.timer -= dt;
    c.tick -= dt;
    if (c.tick <= 0) {
      c.tick = c.every;
      if (c.kind === "spiral") {
        c.angle += 0.34;
        for (let a = 0; a < c.arms; a += 1) shootOrb(e.x, e.y, c.angle + a / c.arms * TAU, speed * 0.66);
      } else if (c.kind === "sweep") {
        c.spread += 0.17 * c.dir;
        if (Math.abs(c.spread) > 0.7) c.dir *= -1;
        shootNeedle(e.x, e.y, aimAt(e.x, e.y) + c.spread, speed * 1);
      } else if (c.kind === "ring") {
        c.angle += 0.58;
        shootOrb(e.x, e.y, c.angle, speed * 0.72);
        shootOrb(e.x, e.y, c.angle + Math.PI, speed * 0.72);
      } else if (c.kind === "wall") {
        const sway = Math.sin(e.t * 1.4) * 0.5;
        for (let i = -2; i <= 2; i += 1) {
          if (i === 0) continue;
          shootOrb(e.x + i * 16, e.y, Math.PI / 2 + i * 0.22 + sway * 0.16, speed * 0.65);
        }
      } else if (c.kind === "curtain") {
        c.lane = clamp(c.lane + [-1, 0, 0, 1][Math.floor(Math.random() * 4)], 0, 4);
        for (let i = 0; i < 5; i += 1) {
          if (i === c.lane) continue;
          shootNeedle(state.w * (0.1 + i * 0.2), 18, Math.PI / 2, speed * 0.82);
        }
      }
    }
    if (c.timer <= 0) e.cont = null;
  }
  function updateBoss(e, dt) {
    if (!e.entered) {
      e.y += 74 * dt;
      if (e.y >= e.stopY) {
        e.entered = true;
        e.t = 0;
        e.patternT = 0.7;
        if (state.wave >= 16) e.phase = 2;
      }
      return;
    }
    e.t += dt;
    e.x = state.w / 2 + Math.sin(e.t * 0.55) * (state.w * 0.26);
    e.y = e.stopY + Math.sin(e.t * 1.5) * 10;
    e.spin += dt * 0.4;
    if (e.phase === 1 && e.hp <= e.max * 0.55) {
      e.phase = 2;
      e.flash = 1;
      state.flash = 0.8;
      state.shake = 12;
      burst(e.x, e.y, e.color, 34);
      sfx.explode(true);
      spawnEnemy("rusher", state.w * 0.16, -40);
      spawnEnemy("rusher", state.w * 0.84, -50);
      state.banner = { text: "\u6838\u5FC3\u8FC7\u8F7D", sub: "OVERDRIVE", life: 1.5, max: 1.5 };
      sfx.phase();
      e.windup = 0.6;
      e.cont = null;
    }
    if (e.phase === 2 && e.hp <= e.max * 0.25) {
      e.phase = 3;
      e.flash = 1;
      state.flash = 0.9;
      state.shake = 14;
      burst(e.x, e.y, C.hurt, 30);
      sfx.explode(true);
      spawnEnemy("drone", state.w * 0.24, -50);
      spawnEnemy("drone", state.w * 0.76, -60);
      state.banner = { text: "\u4E34\u754C", sub: "CRITICAL", life: 1.4, max: 1.4 };
      sfx.phase();
      e.windup = 0.6;
      e.cont = null;
    }
    const pace = e.phase === 3 ? 0.7 : e.phase === 2 ? 0.84 : 1;
    if (e.windup > 0) {
      e.windup -= dt;
      if (e.windup <= 0) bossVolley(e);
    } else {
      e.patternT -= dt;
      if (e.patternT <= 0) {
        e.pattern = (e.pattern + 1) % 4;
        e.patternT = 2.8 * pace;
        e.cont = null;
        e.windup = 0.38;
      }
    }
    if (e.windup <= 0) {
      e.fire -= dt;
      if (e.fire <= 0) {
        e.fire = e.phase === 3 ? 0.45 : e.phase === 2 ? 0.56 : 0.7;
        shootOrb(e.x + rand(-14, 14), e.y + 18, aimAt(e.x, e.y) + rand(-0.14, 0.14), bulletSpeed() * 0.8);
      }
    }
    bossCont(e, dt);
    e.flash = Math.max(0, e.flash - dt * 3);
  }
  function updateEnemy(e, dt) {
    e.t += dt;
    e.flash = Math.max(0, e.flash - dt * 4);
    if (e.kind === "boss") {
      updateBoss(e, dt);
      return;
    }
    const rk = rank();
    const bs = bulletSpeed();
    if (e.kind === "drone") {
      if (e.free) {
        e.x += e.free.vx * dt;
        e.y += e.free.vy * dt;
        e.free.vy += 26 * dt;
      } else {
        e.y += (118 + state.wave * 3) * dt;
        e.x += Math.sin(e.t * 2.2 + e.seed) * e.amp * dt;
      }
      e.fire -= dt;
      if (e.fire <= 0 && e.y > 20 && e.y < state.h * 0.86) {
        e.fire = 2.1 / rk;
        shootOrb(e.x, e.y, aimAt(e.x, e.y), bs);
      }
    } else if (e.kind === "rusher") {
      if (e.phase === 0) {
        e.y += 170 * dt;
        if (e.y >= e.stopY) {
          e.phase = 1;
          e.charge = 0.62 / rk;
        }
      } else if (e.phase === 1) {
        e.charge -= dt;
        if (e.charge <= 0) {
          const a = aimAt(e.x, e.y);
          e.vx = Math.cos(a) * 520;
          e.vy = Math.sin(a) * 520;
          e.phase = 2;
          state.shake = Math.max(state.shake, 3);
        }
      } else {
        e.x += e.vx * dt;
        e.y += e.vy * dt;
        if (Math.random() < 0.7) {
          particles.push({
            x: e.x,
            y: e.y,
            vx: rand(-16, 16),
            vy: rand(-30, 30),
            life: 0.22,
            max: 0.22,
            size: rand(1, 2.2),
            color: e.color
          });
        }
      }
    } else if (e.kind === "inter") {
      if (e.y < e.stopY) {
        e.y += 130 * dt;
      } else if (e.phase === 0) {
        e.phase = 1;
        e.charge = 0.95 / rk;
      } else if (e.phase === 1) {
        e.charge -= dt;
        e.aim = aimAt(e.x, e.y);
        if (e.charge <= 0) {
          fireFan(e.x, e.y, 3, 0.11, Math.min(560, bs * 1.7), "needle", 0.01, e.aim);
          e.shots += 1;
          e.phase = 2;
          e.fire = 1.5 / rk;
          state.shake = Math.max(state.shake, 2);
        }
      } else {
        e.fire -= dt;
        if (e.fire <= 0) {
          if (state.waveBudget <= 0 && e.t > 24) e.leaving = true;
          else e.phase = 0;
        }
      }
      if (e.leaving) e.y -= 120 * dt;
    } else if (e.kind === "gun") {
      if (e.y < e.stopY) {
        e.y += 88 * dt;
      } else if (!e.leaving) {
        e.x += Math.sin(e.t * 0.8 + e.seed) * 22 * dt;
        e.fire -= dt;
        if (e.fire <= 0) {
          e.fire = 2.15 / rk;
          fireFan(e.x, e.y, 3, 0.3, bs * 0.92, "orb", 0.05);
        }
        if (state.waveBudget <= 0 && e.t > 32) e.leaving = true;
      } else {
        e.y -= 100 * dt;
      }
    } else if (e.kind === "hunter") {
      if (e.y < e.stopY) {
        e.y += 82 * dt;
      } else if (!e.leaving) {
        e.x = e.cx + Math.sin(e.t * 0.85) * e.span;
        e.fire -= dt;
        if (e.fire <= 0) {
          e.fire = 2.35 / rk;
          fireFan(e.x, e.y, 5, 0.52, bs * 0.95, "orb", 0.04);
        }
        if (state.waveBudget <= 0 && e.t > 32) e.leaving = true;
      } else {
        e.y -= 95 * dt;
      }
    } else if (e.kind === "split") {
      if (e.y < e.stopY) {
        e.y += 70 * dt;
      } else {
        e.fire -= dt;
        if (e.fire <= 0) {
          e.fire = 0.22 / rk;
          e.spin += 0.5;
          shootOrb(e.x, e.y, e.spin, bs * 0.72);
          shootOrb(e.x, e.y, e.spin + Math.PI, bs * 0.72);
          if (e.hp < e.max * 0.5) {
            shootOrb(e.x, e.y, e.spin + Math.PI / 2, bs * 0.72);
            shootOrb(e.x, e.y, e.spin - Math.PI / 2, bs * 0.72);
          }
        }
      }
    } else if (e.kind === "fort") {
      if (e.y < e.stopY) {
        e.y += 52 * dt;
      } else if (!e.leaving) {
        e.x += Math.sin(e.t * 0.45) * 26 * dt;
        e.fire -= dt;
        if (e.fire <= 0) {
          e.fire = 3 / rk;
          const n = e.hp < e.max * 0.45 ? 18 : 14;
          fireRing(e.x, e.y, n, bs * 0.56, e.spin, 0.6);
          e.spin += 0.19;
        }
        e.burst -= dt;
        if (e.burst <= 0) {
          e.burst = 1.6 / rk;
          fireFan(e.x, e.y, 3, 0.32, bs, "needle", 0.03);
        }
        if (state.waveBudget <= 0 && e.t > 36) e.leaving = true;
      } else {
        e.y -= 70 * dt;
      }
    }
    if (e.t > 0.5 && (e.y > state.h + 80 || e.y < -220 || e.x < -160 || e.x > state.w + 160)) e.dead = true;
  }
  var FORMATIONS = [
    { id: "swarm", cost: 6, minWave: 1, weight: 3 },
    { id: "pincer", cost: 8, minWave: 2, weight: 2.2 },
    { id: "rush", cost: 8, minWave: 2, weight: 2.4 },
    { id: "line", cost: 10, minWave: 2, weight: 2.2 },
    { id: "snipe", cost: 9, minWave: 3, weight: 1.2 },
    { id: "arc", cost: 12, minWave: 3, weight: 1.3 },
    { id: "split", cost: 14, minWave: 4, weight: 0.8 },
    { id: "heavy", cost: 12, minWave: 5, weight: 0.5 },
    { id: "wall", cost: 16, minWave: 7, weight: 0.4 }
  ];
  function weightedFormation(options) {
    const recent = state.packHistory;
    let pool = options;
    if (recent.length >= 2) {
      const last2 = recent[recent.length - 1];
      const prev = recent[recent.length - 2];
      const filtered = options.filter((f) => !(f.id === last2 && f.id === prev));
      if (filtered.length > 0) pool = filtered;
    }
    const total = pool.reduce((sum, f) => sum + f.weight, 0);
    let roll = Math.random() * total;
    for (const f of pool) {
      roll -= f.weight;
      if (roll <= 0) return f;
    }
    return pool[0];
  }
  function spawnFormation(id) {
    const w = state.w;
    if (id === "swarm") {
      for (let i = 0; i < 6; i += 1) {
        spawnEnemy("drone", w * 0.22 + i % 3 * w * 0.28, -40 - Math.floor(i / 3) * 38);
      }
    } else if (id === "pincer") {
      for (let i = 0; i < 2; i += 1) {
        spawnEnemy("drone", w * 0.1, -40 - i * 44);
        spawnEnemy("drone", w * 0.9, -40 - i * 44);
      }
      spawnEnemy("gun", w * 0.5, -120);
    } else if (id === "rush") {
      for (let i = 0; i < 4; i += 1) spawnEnemy("rusher", w * 0.18 + i * w * 0.21, -40 - i * 26);
    } else if (id === "line") {
      for (let i = 0; i < 3; i += 1) spawnEnemy("gun", w * 0.2 + i * w * 0.3, -40 - i * 30);
    } else if (id === "snipe") {
      spawnEnemy("inter", w * 0.16, -40);
      spawnEnemy("inter", w * 0.84, -70);
    } else if (id === "arc") {
      for (let i = -1; i <= 1; i += 1) spawnEnemy("hunter", w / 2 + i * w * 0.26, -40 - Math.abs(i) * 34);
    } else if (id === "split") {
      spawnEnemy("split", w * 0.32, -50);
      spawnEnemy("split", w * 0.68, -90);
    } else if (id === "heavy") {
      spawnEnemy("fort", w / 2, -80);
      spawnEnemy("drone", w * 0.22, -40);
      spawnEnemy("drone", w * 0.78, -40);
    } else if (id === "wall") {
      for (let i = 0; i < 5; i += 1) spawnEnemy("gun", w * 0.14 + i * w * 0.18, -40 - Math.abs(i - 2) * 22);
      spawnEnemy("rusher", w * 0.5, -150);
    }
  }
  function updateBullets(dt) {
    const k = state.buff.slow > 0 ? 0.5 : 1;
    for (const b of ebullets) {
      b.x += b.vx * dt * k;
      b.y += b.vy * dt * k;
    }
    ebullets = ebullets.filter((b) => b.y > -60 && b.y < state.h + 60 && b.x > -70 && b.x < state.w + 70);
    for (const b of pbullets) {
      b.x += b.vx * dt;
      b.y += b.vy * dt;
    }
    pbullets = pbullets.filter((b) => b.y > -30);
  }
  var PICKUPS = {
    over: { label: "\u8D85\u8F7D", color: "#ffe08a", weight: 30, time: 8 },
    slow: { label: "\u8FDF\u6EDE", color: "#7fe7ff", weight: 22, time: 4.5 },
    shield: { label: "\u62A4\u76FE", color: "#f4f1e6", weight: 24 },
    pulse: { label: "\u8109\u51B2", color: "#ff7a8f", weight: 12 },
    repair: { label: "\u4FEE\u590D", color: "#a6f08a", weight: 20 }
  };
  function rollPickup() {
    const list = Object.entries(PICKUPS).filter(([id]) => {
      if (id === "shield" && state.shield > 0) return false;
      if (id === "repair" && state.lives >= LIVES) return false;
      return true;
    });
    const total = list.reduce((sum, [, spec]) => sum + spec.weight, 0);
    let roll = Math.random() * total;
    for (const [id, spec] of list) {
      roll -= spec.weight;
      if (roll <= 0) return id;
    }
    return list[0][0];
  }
  function dropPickup(x, y, forced) {
    drops.push({
      x,
      y,
      vx: rand(-18, 18),
      vy: rand(42, 66),
      t: 0,
      type: forced || rollPickup(),
      life: 13
    });
  }
  function maybeDrop(e) {
    if (e.kind === "boss") {
      for (let i = 0; i < 3; i += 1) dropPickup(e.x + rand(-40, 40), e.y + rand(-20, 20));
      return;
    }
    const chance = e.tier >= 5 ? 0.4 : e.tier >= 3 ? 0.14 : 0.07;
    if (state.lives === 1 && e.tier >= 2 && Math.random() < 0.22) {
      dropPickup(e.x, e.y, "repair");
      return;
    }
    if (Math.random() < chance) dropPickup(e.x, e.y);
  }
  function healPlayer(amount, rewardIfFull) {
    if (state.lives >= LIVES) {
      if (rewardIfFull) {
        addScore(400);
        popups.push({ x: player.x, y: player.y - 28, text: "+400", life: 0.9, max: 0.9, color: C.bone });
        sfx.pickup("repair");
      }
      return false;
    }
    state.lives = Math.min(LIVES, state.lives + amount);
    state.pressure = clamp(state.pressure + 0.05, 0, 1);
    updateHud();
    hpEl.classList.add("is-heal");
    window.setTimeout(() => hpEl.classList.remove("is-heal"), 450);
    popups.push({ x: player.x, y: player.y - 28, text: "HP +1", life: 1, max: 1, color: "#a6f08a" });
    burst(player.x, player.y, "#a6f08a", 12);
    sfx.heal();
    return true;
  }
  function updateDrops(dt) {
    for (const d of drops) {
      d.t += dt;
      d.life -= dt;
      const dx = player.x - d.x;
      const dy = player.y - d.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 86) {
        const pull = 1 - dist / 86;
        d.vx += dx / (dist || 1) * 1100 * pull * dt;
        d.vy += dy / (dist || 1) * 1100 * pull * dt;
        d.vx = clamp(d.vx, -280, 280);
        d.vy = clamp(d.vy, -280, 280);
      } else {
        d.vy += 14 * dt;
        d.vy = Math.min(d.vy, 80);
      }
      d.x += (d.vx + Math.sin(d.t * 2.4) * 14) * dt;
      d.y += d.vy * dt;
      if (dist < 22) collectPickup(d);
    }
    drops = drops.filter((d) => !d.taken && d.life > 0 && d.y < state.h + 40);
  }
  function collectPickup(d) {
    d.taken = true;
    const spec = PICKUPS[d.type];
    if (d.type === "over") state.buff.over = Math.max(state.buff.over, spec.time);
    else if (d.type === "slow") state.buff.slow = Math.max(state.buff.slow, spec.time);
    else if (d.type === "shield") state.shield = 1;
    else if (d.type === "pulse") pulseBlast();
    else if (d.type === "repair") healPlayer(1, true);
    popups.push({ x: d.x, y: d.y, text: spec.label, life: 1.1, max: 1.1, color: spec.color });
    burst(d.x, d.y, spec.color, 14);
    if (d.type !== "repair") sfx.pickup(d.type);
    updateBuffs();
  }
  function pulseBlast() {
    for (const b of ebullets) addScore(2);
    ebullets = [];
    for (const e of enemies) {
      if (!e.dead) damageEnemy(e, 26);
    }
    state.flash = 0.7;
    state.shake = 12;
    burst(player.x, player.y, C.hurt, 30);
    sfx.explode(true);
  }
  var fireInterval = () => 0.13 * 0.84 ** state.up.rate * (state.buff.over > 0 ? 0.62 : 1);
  var streamCount = () => 2 + state.up.stream + (state.buff.over > 0 ? 2 : 0);
  var damage = () => 1 + state.up.dmg;
  var power = () => state.up.rate + state.up.dmg + state.up.stream + (state.buff.over > 0 ? 2 : 0);
  function updatePlayer(dt) {
    if (state.invuln > 0) state.invuln -= dt;
    player.focus = keys.has("shift") || pointerDown;
    let tx = moveTarget.x;
    let ty = moveTarget.y;
    if (AUTOPILOT) {
      tx = player.x;
      ty = player.y;
      const target = enemies[0];
      if (target) {
        tx = target.x;
        ty = Math.min(player.y, state.h - 180);
      }
      for (const b of ebullets) {
        const dx2 = player.x - b.x;
        const dy2 = player.y - b.y;
        const d2 = Math.hypot(dx2, dy2);
        if (d2 < 96) {
          tx += dx2 / (d2 || 1) * (96 - d2) * 1.5;
          ty += dy2 / (d2 || 1) * (96 - d2) * 0.85;
        }
      }
      tx = clamp(tx, 24, state.w - 24);
      ty = clamp(ty, 60, state.h - 60);
    }
    if (AUTOPILOT || player.focus) {
      const dx = tx - player.x;
      const dy = ty - player.y;
      const d = Math.hypot(dx, dy);
      const step = Math.min(d, 300 * dt);
      if (d > 0.6) {
        player.x += dx / d * step;
        player.y += dy / d * step;
      }
    } else {
      player.x = tx;
      player.y = ty;
    }
    player.x = clamp(player.x, 18, state.w - 18);
    player.y = clamp(player.y, 50, state.h - 26);
    state.fireTimer -= dt;
    if (state.fireTimer <= 0) {
      state.fireTimer = fireInterval();
      fire();
    }
    if (Math.random() < 0.5) {
      particles.push({
        x: player.x + rand(-3, 3),
        y: player.y + 12,
        vx: rand(-10, 10),
        vy: rand(40, 90),
        life: rand(0.14, 0.28),
        max: 0.28,
        size: rand(1, 2),
        color: C.heat
      });
    }
  }
  function fire() {
    const n = streamCount();
    for (let i = 0; i < n; i += 1) {
      const off = (i - (n - 1) / 2) * 8;
      pbullets.push({ x: player.x + off, y: player.y - 14, vx: 0, vy: -1e3, r: 2.4, dmg: damage() });
    }
    particles.push({
      x: player.x,
      y: player.y - 16,
      vx: 0,
      vy: -30,
      life: 0.1,
      max: 0.1,
      size: 2.2,
      color: C.bone
    });
    sfx.shot();
  }
  function addScore(value) {
    state.score += Math.round(value);
    scoreEl.textContent = format(state.score);
    checkPick();
    updatePickProgress();
  }
  function updatePickProgress() {
    const ratio = clamp(state.score / state.pickAt, 0, 1);
    pickFill.style.width = `${(ratio * 100).toFixed(1)}%`;
    pickNum.textContent = state.pickQueue > 0 ? "\u5C31\u7EEA" : format(Math.max(0, state.pickAt - state.score));
  }
  function checkPick() {
    while (state.score >= state.pickAt) {
      state.pickAt = Math.round(state.pickAt * 2);
      state.pickQueue = Math.min(3, state.pickQueue + 1);
    }
  }
  function openUpgrade() {
    if (state.pendingPick) return;
    if (!UPGRADES.some((u) => state.up[u.id] < u.max)) {
      state.pickQueue = 0;
      return;
    }
    state.pendingPick = true;
    state.mode = "upgrade";
    moveTarget = { x: player.x, y: player.y };
    upKicker.textContent = "\u5206\u6570\u5956\u52B1 \xB7 SCORE REWARD";
    showUpgrades();
  }
  function bumpChain() {
    state.chain = Math.min(10, state.chain + 1);
    state.chainTimer = 3;
    chainEl.textContent = `\u8FDE\u9501 \xD7${state.chain}`;
    if ([3, 5, 7, 10].includes(state.chain)) sfx.chain(state.chain);
  }
  function resetChain() {
    state.chain = 1;
    state.chainTimer = 0;
    chainEl.textContent = "";
  }
  function damageEnemy(e, amount) {
    e.hp -= amount;
    e.flash = 1;
    if (e.hp > 0 || e.dead) return;
    e.dead = true;
    const isBoss = e.kind === "boss";
    const points = Math.round(50 * e.value * state.chain + (isBoss ? 2400 : 0));
    addScore(points);
    bumpChain();
    burst(e.x, e.y, e.color, isBoss ? 48 : e.tier >= 6 ? 16 : 8);
    popups.push({ x: e.x, y: e.y, text: `+${points}`, life: 0.8, max: 0.8, big: isBoss });
    state.shake = Math.max(state.shake, isBoss ? 16 : e.tier >= 6 ? 6 : 3);
    sfx.explode(isBoss);
    maybeDrop(e);
    if (e.kind === "split") {
      for (let i = 0; i < 3; i += 1) {
        const mini = spawnEnemy("drone", e.x + rand(-8, 8), e.y + rand(-6, 6));
        const a = -Math.PI / 2 + (i - 1) * 0.75;
        mini.free = { vx: Math.cos(a) * 120, vy: Math.sin(a) * 80 };
      }
    }
    if (isBoss) {
      state.boss = null;
      bossbar.hidden = true;
      state.pressure = clamp(state.pressure + 0.06, 0, 1);
      state.flash = Math.max(state.flash, 0.75);
      ebullets = [];
      healPlayer(1, false);
      spawnEnemy("drone", state.w * 0.24, -40);
      spawnEnemy("drone", state.w * 0.76, -40);
    }
  }
  function collide() {
    for (const b of ebullets) {
      const dx = b.x - player.x;
      const dy = b.y - player.y;
      const d = Math.hypot(dx, dy);
      if (d < player.r + b.r * 0.58) {
        b.hit = true;
        hitPlayer();
        continue;
      }
      if (!b.grazed && d < 27) {
        b.grazed = true;
        state.graze += 1;
        grazeEl.textContent = `\u64E6\u5F39 ${state.graze}`;
        addScore(6);
        sfx.graze();
        particles.push({ x: b.x, y: b.y, vx: 0, vy: -18, life: 0.3, max: 0.3, size: 1.4, color: C.bone });
      }
    }
    ebullets = ebullets.filter((b) => !b.hit);
    for (const b of pbullets) {
      for (const e of enemies) {
        if (e.dead) continue;
        if (Math.hypot(b.x - e.x, b.y - e.y) < e.r + b.r + 2) {
          b.dead = true;
          damageEnemy(e, b.dmg);
          burst(b.x, b.y, C.bone, 2);
          break;
        }
      }
    }
    pbullets = pbullets.filter((b) => !b.dead);
    for (const e of enemies) {
      if (e.dead || e.kind === "boss") continue;
      if (Math.hypot(e.x - player.x, e.y - player.y) < e.r + player.r) hitPlayer();
    }
    enemies = enemies.filter((e) => !e.dead);
  }
  function hitPlayer() {
    if (GOD || state.invuln > 0 || state.mode !== "playing") return;
    if (state.shield > 0) {
      state.shield = 0;
      state.invuln = 1.2;
      state.shake = 10;
      state.flash = 0.5;
      ebullets = ebullets.filter((b) => Math.hypot(b.x - player.x, b.y - player.y) > 130);
      burst(player.x, player.y, C.bone, 18);
      sfx.shieldBreak();
      updateBuffs();
      return;
    }
    state.shake = 18;
    state.flash = 1;
    state.slow = 0.5;
    burst(player.x, player.y, C.hurt, 22);
    resetChain();
    state.lives -= 1;
    state.pressure = clamp(state.pressure - 0.12, 0, 1);
    updateHud();
    sfx.hit();
    if (state.lives === 1) sfx.alarm();
    if (state.lives <= 0) {
      if (state.boss) {
        state.boss = null;
        bossbar.hidden = true;
      }
      endRun();
      return;
    }
    state.invuln = 2.4;
    ebullets = [];
    player.x = state.w / 2;
    player.y = state.h - 100;
    moveTarget = { x: player.x, y: player.y };
  }
  function updateWaveLabel() {
    const z = zoneNow();
    waveEl.textContent = `W${String(Math.max(1, state.wave)).padStart(2, "0")} \xB7 ${z.name}`;
  }
  function startWave(n) {
    state.wave = n;
    markWave(n);
    state.heavyCount = 0;
    state.splitCount = 0;
    state.wallCount = 0;
    state.packHistory = [];
    state.eliteCooldown = 2;
    state.waveBudget = Math.round((30 + n * 9) * (0.9 + state.pressure * 0.2));
    state.spawnTimer = 1;
    state.waveQuiet = 0;
    state.bossPending = n % 4 === 0;
    const totalUp = state.up.rate + state.up.dmg + state.up.stream;
    if (totalUp < Math.floor(n / 3)) state.pickQueue = Math.min(3, state.pickQueue + 1);
    const zoneIndex = Math.floor((n - 1) / 4);
    const changed = zoneIndex !== backdrop.zone;
    if (changed) setZone(zoneIndex);
    if (changed && backdrop.planet) backdrop.planet.y = -backdrop.planet.r * 1.2;
    const z = zoneNow();
    if (state.bossPending) {
      state.waveBudget = 0;
      state.spawnTimer = 1.8;
      state.banner = { text: `WAVE ${String(n).padStart(2, "0")}`, sub: `\u6838\u5FC3\u63A5\u8FD1 \xB7 ${z.name}`, life: 1.8, max: 1.8 };
    } else if (changed) {
      state.banner = { text: z.name, sub: `ZONE ${String(zoneIndex + 1).padStart(2, "0")} \xB7 ${z.code}`, life: 2.2, max: 2.2 };
    } else {
      state.banner = { text: `WAVE ${String(n).padStart(2, "0")}`, sub: z.code, life: 1.5, max: 1.5 };
    }
    updateWaveLabel();
    if (state.bossPending) sfx.warn();
    else sfx.wave();
  }
  function countSpawn(id) {
    if (id === "heavy") state.heavyCount += 1;
    else if (id === "split") state.splitCount += 1;
    else if (id === "wall") state.wallCount += 1;
  }
  function updateWave(dt) {
    if (state.bossPending) {
      state.spawnTimer -= dt;
      if (state.spawnTimer <= 0) {
        state.bossPending = false;
        spawnBoss();
      }
      return;
    }
    if (state.waveBudget > 0) {
      state.spawnTimer -= dt;
      const cap = 8 + Math.min(4, Math.floor(state.wave * 0.4));
      if (state.spawnTimer <= 0 && enemies.length < cap - 3) {
        const heavyMax = state.wave >= 12 && state.pressure > 0.6 ? 2 : 1;
        const splitMax = state.wave >= 10 ? 2 : 1;
        const eliteReady = state.eliteCooldown <= 0;
        const ELITE = ["heavy", "split", "wall"];
        const options = FORMATIONS.filter((f) => {
          if (f.minWave > state.wave || f.cost > state.waveBudget) return false;
          if (ELITE.includes(f.id) && !eliteReady) return false;
          if (f.id === "heavy" && state.heavyCount >= heavyMax) return false;
          if (f.id === "split" && state.splitCount >= splitMax) return false;
          if (f.id === "wall" && state.wallCount >= 1) return false;
          return true;
        });
        if (options.length === 0) {
          state.waveBudget = 0;
        } else {
          const pack = weightedFormation(options);
          spawnFormation(pack.id);
          countSpawn(pack.id);
          state.waveBudget -= pack.cost;
          if (ELITE.includes(pack.id)) state.eliteCooldown = 3;
          else state.eliteCooldown = Math.max(0, state.eliteCooldown - 1);
          state.packHistory.push(pack.id);
          if (state.packHistory.length > 4) state.packHistory.shift();
          const light = ["swarm", "rush", "line", "snipe", "arc"];
          if (state.wave >= 8 && state.pressure > 0.6 && light.includes(pack.id) && state.waveBudget >= 6 && enemies.length < cap - 4) {
            const extraOptions = options.filter((f) => light.includes(f.id) && f.cost <= state.waveBudget);
            if (extraOptions.length > 0) {
              const extra = weightedFormation(extraOptions);
              spawnFormation(extra.id);
              state.waveBudget -= extra.cost;
              state.packHistory.push(extra.id);
              if (state.packHistory.length > 4) state.packHistory.shift();
            }
          }
          state.spawnTimer = Math.max(2.2, rand(3, 4.1) - state.wave * 0.035) * (1.05 - state.pressure * 0.12);
        }
      }
    }
    if (state.waveBudget <= 0 && enemies.length === 0 && !state.bossPending) {
      state.waveQuiet += dt;
      if (state.waveQuiet > 1.4) waveClear();
    } else {
      state.waveQuiet = 0;
    }
  }
  function waveClear() {
    state.pressure = clamp(state.pressure + 0.04, 0, 1);
    healPlayer(1, false);
    burst(player.x, player.y - 20, C.heat, 18);
    sfx.clear();
    state.mode = "clear";
    state.clearTimer = 1.9;
    state.banner = { text: "WAVE CLEAR", sub: "\u8865\u7ED9 \xB7 +1 HP", life: 1.8, max: 1.8 };
  }
  var UPGRADES = [
    { id: "rate", name: "\u5C04\u901F", desc: "\u5C04\u51FB\u95F4\u9694 -16%", max: 5 },
    { id: "dmg", name: "\u4F24\u5BB3", desc: "\u6BCF\u53D1\u4F24\u5BB3 +1", max: 5 },
    { id: "stream", name: "\u591A\u91CD\u5C04\u51FB", desc: "\u5F39\u9053 +1", max: 3 }
  ];
  function upgradeDetail(id) {
    if (id === "rate") return `\u73B0 ${Math.round(fireInterval() * 1e3)}ms`;
    if (id === "dmg") return `\u73B0 ${damage()}/\u53D1`;
    return `\u73B0 ${streamCount()} \u9053`;
  }
  function showUpgrades() {
    const offers = UPGRADES.filter((u) => state.up[u.id] < u.max);
    upgradeOptions.replaceChildren();
    if (offers.length === 0) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "up-card";
      btn.innerHTML = '<span class="up-key">1</span><span><span class="up-name">\u7EE7\u7EED</span><span class="up-desc">\u706B\u529B\u5DF2\u6EE1\uFF0C\u7EE7\u7EED\u6218\u6597</span></span>';
      btn.addEventListener("click", () => chooseUpgrade(null));
      upgradeOptions.append(btn);
    } else {
      offers.forEach((up, i) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "up-card";
        btn.innerHTML = `<span class="up-key">${i + 1}</span><span><span class="up-name">${up.name}</span><span class="up-desc">${up.desc} \xB7 ${upgradeDetail(up.id)} \xB7 \u5DF2\u6709 ${state.up[up.id]}/${up.max}</span></span>`;
        btn.addEventListener("click", () => chooseUpgrade(up));
        upgradeOptions.append(btn);
      });
    }
    upgradeEl.hidden = false;
    if (AUTOPILOT) {
      const auto = offers[0] || null;
      window.setTimeout(() => {
        if (state.mode === "upgrade") chooseUpgrade(auto);
      }, 240);
    }
  }
  function chooseUpgrade(up) {
    sfx.confirm();
    if (up) state.up[up.id] += 1;
    upgradeEl.hidden = true;
    state.mode = "playing";
    state.pendingPick = false;
    state.pickQueue = Math.max(0, state.pickQueue - 1);
    moveTarget = { x: player.x, y: player.y };
    updatePower();
    updatePickProgress();
  }
  function runSteps(count) {
    const dt = 1 / 120;
    try {
      for (let i = 0; i < count; i += 1) {
        if (state.mode === "upgrade" && !PARAMS.has("hold")) {
          const offers = UPGRADES.filter((u) => state.up[u.id] < u.max);
          chooseUpgrade(offers[0] || null);
        }
        update(dt);
      }
      draw();
    } catch (error) {
      if (window.__report) window.__report(`STEP ${error && error.stack ? error.stack : error}`);
    }
  }
  function endRun() {
    sfx.death();
    state.mode = "over";
    const isBest = state.score > best;
    if (isBest) {
      best = state.score;
      bestEl.textContent = format(best);
      persistBest();
    }
    const actions = bestWave > 1 ? [
      { label: `\u518D\u6765\u4E00\u5C40 \u7B2C ${bestWave} \u6CE2`, primary: true, run: () => startRun(bestWave) },
      { label: "\u4ECE\u7B2C 1 \u6CE2\u5F00\u59CB", run: () => startRun(1) },
      { label: "\u8FD4\u56DE", run: () => toMenu() }
    ] : [
      { label: "\u518D\u6765\u4E00\u5C40", primary: true, run: () => startRun(1) },
      { label: "\u8FD4\u56DE", run: () => toMenu() }
    ];
    showGate({
      kicker: "\u4FE1\u53F7\u4E2D\u65AD \xB7 SIGNAL LOST",
      title: format(state.score),
      text: `\u6CE2\u6B21 <strong>${state.wave}</strong> \xB7 \u533A\u57DF <strong>${zoneNow().name}</strong> \xB7 \u64E6\u5F39 <strong>${state.graze}</strong><br>\u6700\u9AD8 <strong>\u7B2C ${bestWave} \u6CE2</strong> \xB7 \u6700\u4F73 <strong>${format(best)}</strong>${isBest ? " \xB7 <em>NEW RECORD</em>" : ""}`,
      actions
    });
  }
  function showGate({ kicker, title, text, actions }) {
    gateKicker.textContent = kicker;
    gateTitle.textContent = title;
    gateText.innerHTML = text;
    gateActions.replaceChildren();
    for (const action of actions) {
      const button2 = document.createElement("button");
      button2.type = "button";
      button2.className = `gate-button${action.primary ? " primary" : ""}`;
      button2.textContent = action.label;
      button2.addEventListener("click", () => {
        sfx.confirm();
        action.run();
      });
      gateActions.append(button2);
    }
    gate.hidden = false;
    requestAnimationFrame(() => gateActions.querySelector("button")?.focus({ preventScroll: true }));
  }
  function hideGate() {
    gate.hidden = true;
  }
  var MENU_LEGEND = `
<div class="legend">
<span><i style="background:#8ea3c0"></i>\u4FA6\u5BDF \xB7 \u4FEF\u51B2</span>
<span><i style="background:#c9f25f"></i>\u7A81\u88AD \xB7 \u51B2\u649E</span>
<span><i style="background:#f2efe4"></i>\u62E6\u622A \xB7 \u72D9\u51FB</span>
<span><i style="background:#ffb45e"></i>\u70AE\u8247 \xB7 \u4E09\u8FDE</span>
<span><i style="background:#6fd8ff"></i>\u6E38\u730E \xB7 \u4E94\u8FDE</span>
<span><i style="background:#c084ff"></i>\u5206\u88C2 \xB7 \u87BA\u65CB</span>
<span><i style="background:#ff4f63"></i>\u5821\u5792 \xB7 \u73AF\u5F62</span>
</div>`;
  function toMenu() {
    state.mode = "menu";
    hideGate();
    upgradeEl.hidden = true;
    resetRun();
    setZone(0, true);
    buildSky();
    showGate({
      kicker: "VERTICAL DANMAKU",
      title: "\u5F39\u96E8",
      text: `\u81EA\u52A8\u5C04\u51FB\uFF0C\u51FB\u7834\u654C\u673A\uFF0C\u8EB2\u5F00\u5F39\u5E55\u3002<br>\u5206\u6570\u8FBE\u5230\u9608\u503C\u65F6\u6682\u505C\u9009\u62E9\u5F3A\u5316\uFF1A<strong>\u5C04\u901F\u3001\u4F24\u5BB3\u3001\u591A\u91CD\u5C04\u51FB</strong>\u3002<br>\u6700\u9AD8 <strong>\u7B2C ${bestWave} \u6CE2</strong> \xB7 \u6700\u4F73 <strong>${format(best)}</strong>\u3002${MENU_LEGEND}`,
      actions: bestWave > 1 ? [
        { label: `\u7EE7\u7EED \u7B2C ${bestWave} \u6CE2`, primary: true, run: () => startRun(bestWave) },
        { label: "\u4ECE\u7B2C 1 \u6CE2\u5F00\u59CB", run: () => startRun(1) }
      ] : [{ label: "\u51FA\u51FB", primary: true, run: () => startRun(1) }]
    });
    updateHud();
    syncPauseButton();
  }
  function resetRun() {
    state.score = 0;
    state.chain = 1;
    state.chainTimer = 0;
    state.graze = 0;
    state.lives = LIVES;
    state.wave = 0;
    state.invuln = 0;
    state.slow = 0;
    state.banner = null;
    state.boss = null;
    state.bossPending = false;
    state.pressure = 0.5;
    state.pickAt = 12e3;
    state.pickQueue = 0;
    state.pendingPick = false;
    updatePickProgress();
    state.heavyCount = 0;
    state.splitCount = 0;
    state.wallCount = 0;
    state.up = { rate: 0, dmg: 0, stream: 0 };
    enemies = [];
    ebullets = [];
    pbullets = [];
    particles = [];
    popups = [];
    drops = [];
    state.shield = 0;
    state.buff = { over: 0, slow: 0 };
    state.buffTick = 0;
    updateBuffs();
    player.x = state.w / 2;
    player.y = state.h - 110;
    moveTarget = { x: player.x, y: player.y };
    bossbar.hidden = true;
    chainEl.textContent = "";
    upgradeEl.hidden = true;
    state.pendingPick = false;
    state.pickQueue = 0;
    tipEl.hidden = true;
    state.tipTimer = 0;
    grazeEl.textContent = "\u64E6\u5F39 0";
    waveEl.textContent = "W01 \xB7 \u6DF1\u7A7A";
    updatePower();
  }
  function grantStarter(wave) {
    const grant = Math.min(12, Math.floor(wave / 3));
    for (let i = 0; i < grant; i += 1) {
      const up = UPGRADES[i % UPGRADES.length];
      if (state.up[up.id] < up.max) state.up[up.id] += 1;
    }
  }
  function startRun(fromWave) {
    const wave = DEBUG_WAVE ? START_WAVE : clamp(Math.floor(fromWave || 1), 1, 999);
    hideGate();
    upgradeEl.hidden = true;
    resetRun();
    grantStarter(wave);
    state.runStartWave = wave;
    updatePower();
    const hp = Number(PARAMS.get("hp"));
    if (hp > 0) state.lives = clamp(Math.floor(hp), 1, LIVES);
    const pick = Number(PARAMS.get("pick"));
    if (pick > 0) state.pickAt = pick;
    state.mode = "playing";
    state.fireTimer = 0;
    startWave(wave);
    updateHud();
    syncPauseButton();
    if (!state.tipShown) {
      state.tipShown = true;
      state.tipTimer = 4.5;
      tipEl.hidden = false;
      tipEl.classList.add("is-in");
    }
  }
  function togglePause() {
    if (state.mode === "playing") {
      state.mode = "paused";
      moveTarget = { x: player.x, y: player.y };
      showGate({
        kicker: "\u6682\u505C \xB7 HOLD",
        title: "\u6682\u505C",
        text: "\u53F3\u952E\u3001P \u6216 Esc \u7EE7\u7EED\u3002",
        actions: [
          { label: "\u7EE7\u7EED", primary: true, run: () => {
            state.mode = "playing";
            moveTarget = { x: player.x, y: player.y };
            hideGate();
            syncPauseButton();
          } },
          { label: "\u91CD\u65B0\u5F00\u59CB", run: () => startRun(state.runStartWave) }
        ]
      });
    } else if (state.mode === "paused") {
      state.mode = "playing";
      moveTarget = { x: player.x, y: player.y };
      hideGate();
    }
    syncPauseButton();
  }
  function syncPauseButton() {
    pauseBtn.classList.toggle("is-active", state.mode === "playing" || state.mode === "paused");
    pauseBtn.disabled = state.mode === "menu" || state.mode === "over";
  }
  function format(value) {
    if (value >= 1e5) return `${Math.floor(value / 1e3)}k`;
    if (value >= 1e4) return `${(value / 1e3).toFixed(1).replace(/\.0$/, "")}k`;
    return value.toLocaleString("en-US");
  }
  function updateHud() {
    scoreEl.textContent = format(state.score);
    bestEl.textContent = format(best);
    if (livesEl.children.length !== LIVES) {
      livesEl.replaceChildren();
      for (let i = 0; i < LIVES; i += 1) {
        const pip = document.createElement("span");
        pip.className = "pip";
        livesEl.append(pip);
      }
    }
    for (let i = 0; i < livesEl.children.length; i += 1) livesEl.children[i].classList.toggle("spent", i >= state.lives);
    livesEl.classList.toggle("low", state.lives === 1);
    hpNum.textContent = `${state.lives}/${LIVES}`;
    updateWaveLabel();
  }
  function renderMeters() {
    const fill = (el2, value, max, bonus) => {
      el2.replaceChildren();
      for (let i = 0; i < max; i += 1) {
        const pip = document.createElement("b");
        if (i < value) pip.className = "on";
        el2.append(pip);
      }
      for (let i = 0; i < (bonus || 0); i += 1) {
        const pip = document.createElement("b");
        pip.className = "bonus";
        el2.append(pip);
      }
    };
    fill(meterRate, state.up.rate, 5);
    fill(meterDmg, state.up.dmg, 5);
    fill(meterStream, state.up.stream, 3, state.buff.over > 0 ? 2 : 0);
  }
  function updatePower() {
    powerEl.textContent = `\u706B\u529B ${power()}`;
    renderMeters();
  }
  function buffChip(label, color, seconds) {
    const chip = document.createElement("span");
    chip.className = "buff";
    chip.style.color = color;
    const dot = document.createElement("i");
    const name = document.createElement("b");
    name.textContent = label;
    chip.append(dot, name);
    if (seconds > 0) {
      const time = document.createElement("em");
      time.textContent = `${Math.ceil(seconds)}s`;
      chip.append(time);
      if (seconds < 1.5) chip.classList.add("is-ending");
    }
    buffsEl.append(chip);
  }
  function updateBuffs() {
    buffsEl.replaceChildren();
    if (state.buff.over > 0) buffChip("\u8D85\u8F7D", "#ffe08a", state.buff.over);
    if (state.buff.slow > 0) buffChip("\u8FDF\u6EDE", "#7fe7ff", state.buff.slow);
    if (state.shield > 0) buffChip("\u62A4\u76FE", "#f4f1e6", 0);
    updatePower();
  }
  function burst(x, y, color, count) {
    for (let i = 0; i < count; i += 1) {
      const a = rand(0, TAU);
      const s = rand(40, 260);
      particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: rand(0.2, 0.6), max: 0.6, size: rand(1, 2.6), color });
    }
  }
  function pointerToWorld(event) {
    const rect = canvas.getBoundingClientRect();
    pointer.x = clamp((event.clientX - rect.left) / rect.width * state.w, 18, state.w - 18);
    pointer.y = clamp((event.clientY - rect.top) / rect.height * state.h, 20, state.h - 26);
    if (state.mode !== "playing") return;
    moveTarget.x = pointer.x;
    moveTarget.y = pointer.y;
  }
  function bindEvents() {
    stage.addEventListener("pointermove", (event) => pointerToWorld(event));
    stage.addEventListener("pointerdown", (event) => {
      pointerToWorld(event);
      if (event.button === 0) {
        pointerDown = true;
        canvas.focus({ preventScroll: true });
      }
    });
    window.addEventListener("pointerup", () => {
      pointerDown = false;
    });
    window.addEventListener("pointercancel", () => {
      pointerDown = false;
    });
    stage.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      if (state.mode === "playing" || state.mode === "paused") togglePause();
    });
    window.addEventListener("keydown", (event) => {
      const key = event.key.toLowerCase();
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(key)) event.preventDefault();
      if (state.mode === "upgrade") {
        if (key === "1" || key === "2" || key === "3") {
          const card = upgradeOptions.children[Number(key) - 1];
          if (card) card.click();
        }
        return;
      }
      if (key === "p" || key === "escape") {
        if (state.mode === "playing" || state.mode === "paused") togglePause();
        else if (state.mode === "menu") startRun(bestWave);
        return;
      }
      if (key === "r" && (state.mode === "playing" || state.mode === "paused" || state.mode === "over")) {
        startRun(state.runStartWave);
        return;
      }
      if (key === " ") keys.add("space");
    });
    window.addEventListener("keyup", (event) => {
      keys.delete(event.key.toLowerCase());
      keys.delete("space");
    });
    window.addEventListener("blur", () => {
      keys.clear();
      pointerDown = false;
    });
    pauseBtn.addEventListener("click", () => {
      sfx.confirm();
      togglePause();
    });
    soundBtn.addEventListener("click", () => setSound(!soundOn));
    const unlock = () => {
      if (soundOn) ensureAudio();
    };
    window.addEventListener("pointerdown", unlock, { passive: true });
    window.addEventListener("keydown", unlock);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden && state.mode === "playing") togglePause();
    });
    new ResizeObserver(() => resize()).observe(stage);
  }
  var SOUND_KEY = "bullet-rain:sound";
  var audio = null;
  var master = null;
  var noiseBuf = null;
  var soundOn = readSoundPref();
  var lastShotSound = 0;
  var lastGrazeSound = 0;
  function readSoundPref() {
    try {
      const raw = window.localStorage.getItem(SOUND_KEY);
      if (raw === "0") return false;
      if (raw === "1") return true;
    } catch {
    }
    return true;
  }
  function saveSoundPref() {
    try {
      window.localStorage.setItem(SOUND_KEY, soundOn ? "1" : "0");
    } catch {
    }
    try {
      void host.storage.set(SOUND_KEY, soundOn).catch(() => void 0);
    } catch {
    }
  }
  async function loadSoundPref() {
    try {
      const stored = await host.storage.get(SOUND_KEY);
      if (typeof stored === "boolean") {
        soundOn = stored;
        syncSoundButton();
      }
    } catch {
    }
  }
  function syncSoundButton() {
    soundBtn.classList.toggle("is-on", soundOn);
    soundBtn.setAttribute("aria-pressed", String(soundOn));
  }
  function setSound(on) {
    soundOn = on;
    syncSoundButton();
    saveSoundPref();
    if (soundOn) {
      ensureAudio();
      sfx.confirm();
    }
  }
  function ensureAudio() {
    if (!audio) {
      try {
        audio = new (window.AudioContext || window.webkitAudioContext)();
        const highpass = audio.createBiquadFilter();
        highpass.type = "highpass";
        highpass.frequency.value = 34;
        const lowpass = audio.createBiquadFilter();
        lowpass.type = "lowpass";
        lowpass.frequency.value = 7500;
        lowpass.Q.value = 0.4;
        const comp = audio.createDynamicsCompressor();
        comp.threshold.value = -18;
        comp.knee.value = 10;
        comp.ratio.value = 3;
        comp.attack.value = 6e-3;
        comp.release.value = 0.25;
        const shaper = audio.createWaveShaper();
        const curve = new Float32Array(1024);
        for (let i = 0; i < 1024; i += 1) {
          const x = i / 512 - 1;
          curve[i] = Math.tanh(x * 1.8);
        }
        shaper.curve = curve;
        shaper.oversample = "2x";
        master = audio.createGain();
        master.gain.value = 0.62;
        master.connect(highpass).connect(lowpass).connect(shaper).connect(comp);
        comp.connect(audio.destination);
        try {
          const conv = audio.createConvolver();
          conv.buffer = makeImpulse(0.7, 2.6);
          const send = audio.createGain();
          send.gain.value = 0.04;
          master.connect(send).connect(conv).connect(comp);
        } catch {
        }
        noiseBuf = audio.createBuffer(1, Math.floor(audio.sampleRate * 0.6), audio.sampleRate);
        const data = noiseBuf.getChannelData(0);
        for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
      } catch {
        audio = null;
        master = null;
        return;
      }
    }
    if (audio.state === "suspended") void audio.resume();
  }
  function makeImpulse(seconds, decay) {
    const len = Math.floor(audio.sampleRate * seconds);
    const buf = audio.createBuffer(2, len, audio.sampleRate);
    for (let ch = 0; ch < 2; ch += 1) {
      const data = buf.getChannelData(ch);
      for (let i = 0; i < len; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / len) ** decay;
    }
    return buf;
  }
  var panOf = (x) => clamp((x - state.w / 2) / (state.w / 2), -1, 1) * 0.55;
  function blip(freq, duration, type = "square", gain = 0.03, slide = 0, pan = 0, delay = 0, cutoff = 0) {
    if (!soundOn || !audio || !master) return;
    const at = audio.currentTime + delay;
    const cut = cutoff || Math.min(7e3, freq * 9);
    const filter = audio.createBiquadFilter();
    filter.type = "lowpass";
    filter.Q.value = 0.7;
    filter.frequency.setValueAtTime(cut, at);
    filter.frequency.exponentialRampToValueAtTime(Math.max(160, cut * 0.35), at + duration);
    const amp = audio.createGain();
    amp.gain.setValueAtTime(1e-4, at);
    amp.gain.exponentialRampToValueAtTime(gain, at + 0.012);
    amp.gain.exponentialRampToValueAtTime(1e-4, at + duration);
    const panner = audio.createStereoPanner();
    panner.pan.value = pan;
    filter.connect(amp).connect(panner).connect(master);
    const o1 = audio.createOscillator();
    o1.type = type;
    o1.frequency.setValueAtTime(freq, at);
    if (slide) o1.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), at + duration);
    o1.connect(filter);
    const o2 = audio.createOscillator();
    o2.type = type;
    o2.frequency.setValueAtTime(freq * 1.007, at);
    o2.detune.value = rand(-8, 8);
    if (slide) o2.frequency.exponentialRampToValueAtTime(Math.max(30, (freq + slide) * 1.007), at + duration);
    const blend = audio.createGain();
    blend.gain.value = 0.5;
    o2.connect(blend).connect(filter);
    o1.start(at);
    o2.start(at);
    o1.stop(at + duration + 0.03);
    o2.stop(at + duration + 0.03);
  }
  function sub(freq, duration, gain = 0.1, slide = 0, delay = 0) {
    if (!soundOn || !audio || !master) return;
    const at = audio.currentTime + delay;
    const osc = audio.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, at);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), at + duration);
    const amp = audio.createGain();
    amp.gain.setValueAtTime(1e-4, at);
    amp.gain.exponentialRampToValueAtTime(gain, at + 0.012);
    amp.gain.exponentialRampToValueAtTime(1e-4, at + duration);
    osc.connect(amp).connect(master);
    osc.start(at);
    osc.stop(at + duration + 0.03);
  }
  function noiseHit(duration, gain, cutoff, pan = 0, delay = 0) {
    if (!soundOn || !audio || !master || !noiseBuf) return;
    const at = audio.currentTime + delay;
    const src = audio.createBufferSource();
    src.buffer = noiseBuf;
    src.playbackRate.value = rand(0.85, 1.2);
    const filter = audio.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(cutoff, at);
    filter.frequency.exponentialRampToValueAtTime(Math.max(120, cutoff * 0.3), at + duration);
    const amp = audio.createGain();
    amp.gain.setValueAtTime(gain, at);
    amp.gain.exponentialRampToValueAtTime(1e-4, at + duration);
    const panner = audio.createStereoPanner();
    panner.pan.value = pan;
    src.connect(filter).connect(amp).connect(panner).connect(master);
    src.start(at);
    src.stop(at + duration);
  }
  function noiseBand(duration, gain, freq, q = 1, pan = 0, delay = 0) {
    if (!soundOn || !audio || !master || !noiseBuf) return;
    const at = audio.currentTime + delay;
    const src = audio.createBufferSource();
    src.buffer = noiseBuf;
    src.playbackRate.value = rand(0.9, 1.15);
    const filter = audio.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = freq;
    filter.Q.value = q;
    const amp = audio.createGain();
    amp.gain.setValueAtTime(gain, at);
    amp.gain.exponentialRampToValueAtTime(1e-4, at + duration);
    const panner = audio.createStereoPanner();
    panner.pan.value = pan;
    src.connect(filter).connect(amp).connect(panner).connect(master);
    src.start(at);
    src.stop(at + duration);
  }
  var sfx = {
    start() {
      blip(330, 0.18, "triangle", 0.07, 90, 0, 0, 1300);
      blip(494, 0.24, "triangle", 0.06, 130, 0, 0.12, 1600);
      sub(82, 0.32, 0.08, 24);
    },
    wave() {
      blip(392, 0.16, "triangle", 0.05, 40, 0, 0, 1200);
      blip(587, 0.2, "triangle", 0.04, 60, 0, 0.1, 1500);
    },
    warn() {
      for (let i = 0; i < 3; i += 1) {
        sub(54, 0.3, 0.12, -10, i * 0.28);
        blip(108, 0.24, "sawtooth", 0.04, -18, 0, i * 0.28, 340);
        noiseBand(0.24, 0.03, 180, 0.7, 0, i * 0.28);
      }
    },
    phase() {
      blip(240, 0.7, "sawtooth", 0.07, -190, 0, 0, 650);
      noiseHit(0.6, 0.1, 1100);
      sub(70, 0.6, 0.11, -34);
    },
    shot() {
      const now = performance.now();
      if (now - lastShotSound < 58) return;
      lastShotSound = now;
      const pan = panOf(player.x);
      blip(rand(212, 238), 0.07, "triangle", 0.03, -95, pan, 0, 760);
      blip(rand(1250, 1500), 0.03, "square", 0.014, -500, pan, 0, 3200);
      noiseBand(0.03, 0.022, 3600, 0.7, pan);
      sub(92, 0.06, 0.026, -22);
    },
    graze() {
      const now = performance.now();
      if (now - lastGrazeSound < 55) return;
      lastGrazeSound = now;
      blip(1150, 0.03, "triangle", 0.01, -320, panOf(player.x), 0, 3600);
    },
    chain(level) {
      blip(300 + level * 30, 0.12, "triangle", 0.04, 60, 0, 0, 1200);
      sub(100, 0.1, 0.03, 20);
    },
    hit() {
      sub(55, 0.3, 0.2, -18);
      noiseHit(0.16, 0.13, 1400);
      noiseBand(0.05, 0.07, 2600, 0.8);
      blip(120, 0.14, "sawtooth", 0.05, -60, 0, 0, 520);
    },
    alarm() {
      sub(62, 0.18, 0.1, -12);
      blip(124, 0.18, "square", 0.03, -20, 0, 0, 420);
      sub(62, 0.18, 0.08, -12, 0.22);
      blip(124, 0.18, "square", 0.026, -20, 0, 0.22, 420);
    },
    explode(big) {
      if (big) {
        sub(52, 0.5, 0.24, -24);
        noiseHit(0.42, 0.16, 1100);
        noiseBand(0.22, 0.08, 420, 0.6, 0.1, 5e-3);
        noiseBand(0.06, 0.08, 3600, 0.9);
        blip(100, 0.3, "sine", 0.07, -50, 0, 0, 420);
      } else {
        sub(90, 0.16, 0.09, -40);
        noiseHit(0.12, 0.06, 1600);
        noiseBand(0.04, 0.035, 3200, 0.8);
        blip(230, 0.1, "triangle", 0.022, -90, 0, 0, 900);
      }
    },
    pickup(type) {
      const base = { over: 660, slow: 520, shield: 440, pulse: 300, repair: 600 }[type] || 560;
      blip(base, 0.13, "triangle", 0.045, 140, 0, 0, 2e3);
      blip(base * 1.5, 0.18, "triangle", 0.035, 180, 0, 0.07, 2400);
      sub(base / 5, 0.12, 0.025, 12);
    },
    heal() {
      blip(523, 0.14, "triangle", 0.045, 70, 0, 0, 1800);
      blip(784, 0.18, "triangle", 0.038, 90, 0, 0.08, 2200);
      blip(1046, 0.22, "triangle", 0.03, 110, 0, 0.16, 2600);
      sub(130, 0.24, 0.04, 30);
    },
    shieldBreak() {
      noiseHit(0.26, 0.09, 2200);
      noiseBand(0.1, 0.05, 3e3, 0.7);
      blip(340, 0.32, "triangle", 0.055, 120, 0, 0, 1600);
      sub(84, 0.26, 0.08, -26);
    },
    clear() {
      blip(440, 0.18, "triangle", 0.05, 60, 0, 0, 1600);
      blip(660, 0.24, "triangle", 0.042, 80, 0, 0.11, 2e3);
      sub(104, 0.28, 0.05, 10);
    },
    confirm() {
      blip(340, 0.08, "triangle", 0.025, 70, 0, 0, 1100);
      blip(510, 0.1, "triangle", 0.02, 90, 0, 0.05, 1300);
    },
    expire() {
      blip(460, 0.2, "triangle", 0.035, -220, 0, 0, 1200);
    },
    death() {
      sub(48, 1.6, 0.24, -26);
      noiseHit(1.2, 0.16, 1e3);
      blip(300, 1.4, "sawtooth", 0.075, -260, 0, 0, 600);
      blip(150, 1.6, "sine", 0.06, -110, 0, 0.18, 700);
    }
  };
  function resize() {
    state.resizes += 1;
    const rect = stage.getBoundingClientRect();
    const width = Math.max(200, rect.width);
    const height = Math.max(240, rect.height);
    state.dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    state.scale = height / WORLD_H;
    state.w = width / state.scale;
    state.h = WORLD_H;
    canvas.width = Math.round(width * state.dpr);
    canvas.height = Math.round(height * state.dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    setZone(backdrop.zone < 0 ? state.zone : backdrop.zone, true);
    buildSky();
    for (const e of enemies) {
      e.x = clamp(e.x, e.r + 4, state.w - e.r - 4);
    }
    if (state.mode === "menu" || state.mode === "over") {
      player.x = state.w / 2;
      player.y = state.h - 110;
    } else {
      player.x = clamp(player.x || state.w / 2, 20, state.w - 20);
      player.y = clamp(player.y || state.h - 120, 60, state.h - 40);
    }
    moveTarget = { x: player.x, y: player.y };
  }
  function polygon(n, r, rot = 0) {
    ctx.beginPath();
    for (let i = 0; i < n; i += 1) {
      const a = rot + i / n * TAU;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  }
  function fillHull(color) {
    ctx.fillStyle = "rgba(5, 7, 11, 0.93)";
    ctx.fill();
    ctx.fillStyle = tint(color, 0.2);
    ctx.fill();
  }
  function drawHull(e) {
    const r = e.r;
    const color = e.color;
    const line = e.flash > 0.18 ? C.bone : color;
    ctx.strokeStyle = line;
    ctx.fillStyle = "rgba(5, 7, 11, 0.93)";
    ctx.lineJoin = "miter";
    if (e.kind === "drone") {
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(0, r);
      ctx.lineTo(r * 0.95, -r * 0.68);
      ctx.lineTo(0, -r * 0.18);
      ctx.lineTo(-r * 0.95, -r * 0.68);
      ctx.closePath();
      fillHull(color);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, r * 0.18, 1.8, 0, TAU);
      ctx.fillStyle = color;
      ctx.fill();
    } else if (e.kind === "rusher") {
      ctx.lineWidth = 1.7;
      ctx.beginPath();
      ctx.moveTo(0, r * 1.4);
      ctx.lineTo(r * 0.62, -r * 0.2);
      ctx.lineTo(0, -r * 1.15);
      ctx.lineTo(-r * 0.62, -r * 0.2);
      ctx.closePath();
      fillHull(color);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, r * 1.15);
      ctx.lineTo(0, -r * 0.7);
      ctx.moveTo(r * 0.62, -r * 0.2);
      ctx.lineTo(r * 1, -r * 0.78);
      ctx.moveTo(-r * 0.62, -r * 0.2);
      ctx.lineTo(-r * 1, -r * 0.78);
      ctx.stroke();
    } else if (e.kind === "inter") {
      ctx.lineWidth = 1.7;
      ctx.beginPath();
      ctx.moveTo(0, r * 1.05);
      ctx.lineTo(r * 0.5, r * 0.05);
      ctx.lineTo(r * 0.95, -r * 0.24);
      ctx.lineTo(0, -r * 1.15);
      ctx.lineTo(-r * 0.95, -r * 0.24);
      ctx.lineTo(-r * 0.5, r * 0.05);
      ctx.closePath();
      fillHull(color);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, r * 0.7);
      ctx.lineTo(0, -r * 0.55);
      ctx.stroke();
      ctx.strokeStyle = C.hurt;
      ctx.globalAlpha = 0.85;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.22, 0, TAU);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = line;
    } else if (e.kind === "gun") {
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(0, r);
      ctx.lineTo(r * 0.87, 0);
      ctx.lineTo(0, -r);
      ctx.lineTo(-r * 0.87, 0);
      ctx.closePath();
      fillHull(color);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.3, 0, TAU);
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(0, 0, 2, 0, TAU);
      ctx.fill();
      ctx.strokeRect(-2.2, r * 0.34, 4.4, r * 0.5);
    } else if (e.kind === "hunter") {
      ctx.lineWidth = 1.9;
      polygon(6, r, Math.PI / 6);
      fillHull(color);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.46, 0, TAU);
      ctx.stroke();
      ctx.strokeRect(-r * 1.05, -r * 0.16, r * 0.4, r * 0.32);
      ctx.strokeRect(r * 0.65, -r * 0.16, r * 0.4, r * 0.32);
      ctx.fillStyle = color;
      for (let i = 0; i < 3; i += 1) {
        const a = i / 3 * TAU + e.t * 1.6;
        ctx.fillRect(Math.cos(a) * r * 0.76 - 1.6, Math.sin(a) * r * 0.76 - 1.6, 3.2, 3.2);
      }
    } else if (e.kind === "split") {
      ctx.lineWidth = 1.9;
      polygon(8, r, Math.PI / 8);
      fillHull(color);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.36, 0, TAU);
      ctx.stroke();
      ctx.beginPath();
      for (let i = 0; i < 4; i += 1) {
        const a = Math.PI / 8 + i * Math.PI / 2;
        ctx.moveTo(Math.cos(a) * r * 0.52, Math.sin(a) * r * 0.52);
        ctx.lineTo(Math.cos(a) * r * 0.88, Math.sin(a) * r * 0.88);
      }
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(0, 0, 3.2, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 0.7;
      for (let i = 0; i < 3; i += 1) {
        const a = e.spin + i / 3 * TAU;
        ctx.fillRect(Math.cos(a) * r * 0.66 - 1.4, Math.sin(a) * r * 0.66 - 1.4, 2.8, 2.8);
      }
      ctx.globalAlpha = 1;
    } else if (e.kind === "fort") {
      ctx.lineWidth = 2.1;
      const s = r * 0.9;
      ctx.beginPath();
      ctx.rect(-s, -s, s * 2, s * 2);
      fillHull(color);
      ctx.stroke();
      ctx.beginPath();
      ctx.rect(-s * 0.48, -s * 0.48, s * 0.96, s * 0.96);
      ctx.stroke();
      ctx.fillStyle = color;
      for (const [cx, cy] of [[-s, -s], [s, -s], [-s, s], [s, s]]) ctx.fillRect(cx - 2.4, cy - 2.4, 4.8, 4.8);
      ctx.beginPath();
      ctx.moveTo(-s * 0.62, 0);
      ctx.lineTo(s * 0.62, 0);
      ctx.moveTo(0, -s * 0.62);
      ctx.lineTo(0, s * 0.62);
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(0, 0, 2.6, 0, TAU);
      ctx.fill();
    } else if (e.kind === "boss") {
      drawBossHull(e, line);
      if (e.windup > 0) {
        const t = e.windup / 0.45;
        ctx.strokeStyle = tint(e.color, 0.6);
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(0, 0, r + 50 * t, 0, TAU);
        ctx.stroke();
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(0, 0, r + 50 * t + 9, 0, TAU);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }
    if (e.tier <= 7) {
      const n = e.tier;
      const gap = 5.2;
      const startX = -((n - 1) * gap) / 2;
      ctx.fillStyle = e.color;
      ctx.globalAlpha = 0.95;
      for (let i = 0; i < n; i += 1) ctx.fillRect(startX + i * gap - 1.6, r + 8, 3.2, 3.2);
      ctx.globalAlpha = 1;
    }
    if (e.tier >= 5 && e.tier <= 7 && e.hp < e.max) {
      const w = r * 1.9;
      ctx.globalAlpha = 0.22;
      ctx.fillStyle = C.bone;
      ctx.fillRect(-w / 2, -r - 10, w, 1.4);
      ctx.globalAlpha = 0.92;
      ctx.fillStyle = e.color;
      ctx.fillRect(-w / 2, -r - 10, w * clamp(e.hp / e.max, 0, 1), 1.4);
      ctx.globalAlpha = 1;
    }
  }
  function drawBossHull(e, line) {
    const r = e.r;
    const phase2 = e.phase === 2;
    ctx.save();
    ctx.rotate(e.t * 0.3);
    if (e.variant === 0) {
      ctx.lineWidth = 2.4;
      polygon(6, r, 0);
      fillHull(e.color);
      ctx.stroke();
      ctx.beginPath();
      polygon(6, r * 0.62, Math.PI / 6);
      ctx.stroke();
      ctx.beginPath();
      polygon(3, r * 0.34, -e.t * 0.8);
      ctx.fillStyle = tint(e.color, 0.3);
      ctx.fill();
      ctx.stroke();
    } else if (e.variant === 1) {
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(0, r * 1.1);
      ctx.lineTo(r * 0.66, r * 0.15);
      ctx.lineTo(r * 0.42, -r * 0.9);
      ctx.lineTo(0, -r * 1.14);
      ctx.lineTo(-r * 0.42, -r * 0.9);
      ctx.lineTo(-r * 0.66, r * 0.15);
      ctx.closePath();
      fillHull(e.color);
      ctx.stroke();
      for (const s of [-1, 1]) {
        ctx.beginPath();
        ctx.rect(s * r * 0.74 - 6, -r * 0.34, 12, r * 0.68);
        ctx.stroke();
        ctx.fillStyle = tint(e.color, 0.2);
        ctx.fill();
      }
      ctx.beginPath();
      ctx.moveTo(0, r * 0.8);
      ctx.lineTo(0, -r * 0.8);
      ctx.stroke();
    } else {
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, TAU);
      ctx.fillStyle = tint(e.color, 0.08);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.72, 0, TAU);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.3, 0, TAU);
      ctx.fillStyle = tint(e.color, 0.34);
      ctx.fill();
      ctx.stroke();
      for (let i = 0; i < 3; i += 1) {
        const a = i / 3 * TAU + e.t * 0.9;
        ctx.beginPath();
        ctx.rect(Math.cos(a) * r * 0.86 - 3, Math.sin(a) * r * 0.86 - 3, 6, 6);
        ctx.fillStyle = e.color;
        ctx.fill();
      }
    }
    ctx.restore();
    if (phase2) {
      ctx.strokeStyle = C.hurt;
      ctx.globalAlpha = 0.35 + 0.3 * Math.abs(Math.sin(e.t * 5));
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.18, 0, TAU);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    ctx.strokeStyle = line;
  }
  function drawEnemy(e) {
    ctx.save();
    if (e.kind === "inter" && e.phase === 1) {
      const pulse = 0.18 + 0.32 * Math.abs(Math.sin(e.t * 13));
      ctx.strokeStyle = `rgba(255, 95, 109, ${pulse})`;
      ctx.lineWidth = 1;
      ctx.setLineDash([7, 9]);
      ctx.beginPath();
      ctx.moveTo(e.x, e.y);
      ctx.lineTo(e.x + Math.cos(e.aim) * 900, e.y + Math.sin(e.aim) * 900);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    if (e.kind === "rusher" && e.phase === 1) {
      const t = 1 - clamp(e.charge / 0.62, 0, 1);
      ctx.strokeStyle = tint(e.color, 0.25 + t * 0.5);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.r + 8 + t * 12, 0, TAU);
      ctx.stroke();
    }
    ctx.translate(e.x, e.y);
    drawHull(e);
    ctx.restore();
  }
  function drawDrops() {
    for (const d of drops) {
      const spec = PICKUPS[d.type];
      const blink = d.life < 3 ? 0.35 + 0.65 * Math.abs(Math.sin(d.t * 9)) : 1;
      const bob = Math.sin(d.t * 3.4) * 2;
      ctx.save();
      ctx.translate(d.x, d.y + bob);
      ctx.globalAlpha = blink;
      ctx.strokeStyle = spec.color;
      ctx.globalAlpha = blink * 0.65;
      ctx.lineWidth = 1.4;
      for (let i = 0; i < 4; i += 1) {
        const a = d.t * 1.1 + i * Math.PI / 2;
        ctx.beginPath();
        ctx.arc(0, 0, 13.5, a, a + 0.46);
        ctx.stroke();
      }
      ctx.globalAlpha = blink;
      ctx.fillStyle = spec.color;
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = "rgba(233, 229, 216, 0.92)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-4.2, 9);
      ctx.lineTo(0, 15);
      ctx.lineTo(4.2, 9);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(5, 7, 11, 0.6)";
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.arc(0, 0, 7.4, 0, TAU);
      ctx.stroke();
      ctx.strokeStyle = "#05070b";
      ctx.lineWidth = 1.7;
      ctx.lineCap = "square";
      drawPickupIcon(d.type, "#05070b");
      ctx.restore();
    }
  }
  function drawPickupIcon(type, color) {
    ctx.beginPath();
    if (type === "over") {
      ctx.moveTo(-3.6, 0);
      ctx.lineTo(0, -4.2);
      ctx.lineTo(3.6, 0);
      ctx.moveTo(-3.6, 4.4);
      ctx.lineTo(0, 0.2);
      ctx.lineTo(3.6, 4.4);
      ctx.stroke();
    } else if (type === "slow") {
      ctx.arc(0, 0, 4.2, 0, TAU);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -4.4);
      ctx.moveTo(0, 0);
      ctx.lineTo(2.6, 1.2);
      ctx.stroke();
    } else if (type === "shield") {
      ctx.moveTo(0, -5.2);
      ctx.lineTo(4.4, 0);
      ctx.lineTo(0, 5.2);
      ctx.lineTo(-4.4, 0);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, -2.4);
      ctx.lineTo(0, 2.4);
      ctx.stroke();
    } else if (type === "pulse") {
      for (let i = 0; i < 4; i += 1) {
        const a = i / 4 * TAU + Math.PI / 4;
        ctx.moveTo(Math.cos(a) * 1.6, Math.sin(a) * 1.6);
        ctx.lineTo(Math.cos(a) * 5.4, Math.sin(a) * 5.4);
      }
      ctx.stroke();
    } else {
      ctx.moveTo(-4.4, 0);
      ctx.lineTo(4.4, 0);
      ctx.moveTo(0, -4.4);
      ctx.lineTo(0, 4.4);
      ctx.stroke();
    }
  }
  function drawBullets() {
    for (const b of ebullets) {
      if (b.kind === "needle") {
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(Math.atan2(b.vy, b.vx) + Math.PI / 2);
        ctx.fillStyle = "rgba(255, 201, 138, 0.26)";
        ctx.fillRect(-2.8, -10, 5.6, 20);
        ctx.fillStyle = C.hot;
        ctx.fillRect(-1.5, -9, 3, 16);
        ctx.fillStyle = C.bone;
        ctx.fillRect(-0.6, -9, 1.2, 9);
        ctx.restore();
      } else {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, TAU);
        ctx.fillStyle = "rgba(255, 180, 94, 0.18)";
        ctx.fill();
        ctx.strokeStyle = C.hot;
        ctx.lineWidth = 1.7;
        ctx.stroke();
        ctx.fillStyle = C.bone;
        ctx.beginPath();
        ctx.arc(b.x, b.y, 1.5, 0, TAU);
        ctx.fill();
      }
    }
    for (const b of pbullets) {
      ctx.fillStyle = C.heat;
      ctx.fillRect(b.x - 1.4, b.y - 9, 2.8, 16);
      ctx.fillStyle = C.bone;
      ctx.fillRect(b.x - 0.7, b.y - 9, 1.4, 6);
    }
  }
  function drawParticles() {
    for (const p of particles) {
      const t = clamp(p.life / p.max, 0, 1);
      ctx.globalAlpha = t;
      ctx.fillStyle = p.color;
      const s = p.size * (0.5 + t * 0.5);
      ctx.fillRect(p.x, p.y, s, s);
    }
    ctx.globalAlpha = 1;
  }
  function drawPopups() {
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (const p of popups) {
      ctx.globalAlpha = clamp(p.life / p.max, 0, 1);
      ctx.fillStyle = p.big ? C.heat : C.bone;
      ctx.font = `${p.big ? 700 : 500} ${p.big ? 14 : 9}px "Chakra Petch", "Microsoft YaHei", sans-serif`;
      ctx.fillText(p.text, p.x, p.y);
    }
    ctx.globalAlpha = 1;
  }
  function drawShip() {
    const blink = state.invuln > 0 && Math.floor(state.time * 14) % 2 === 0 ? 0.35 : 1;
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.globalAlpha = blink;
    ctx.beginPath();
    ctx.moveTo(0, -18);
    ctx.lineTo(11, 12);
    ctx.lineTo(0, 6);
    ctx.lineTo(-11, 12);
    ctx.closePath();
    ctx.fillStyle = C.bone;
    ctx.fill();
    ctx.strokeStyle = "rgba(5, 7, 11, 0.9)";
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.lineTo(3.2, -1);
    ctx.lineTo(-3.2, -1);
    ctx.closePath();
    ctx.fillStyle = "#05070b";
    ctx.fill();
    ctx.fillStyle = C.heat;
    ctx.fillRect(-2.4, 6.5, 4.8, 4.5);
    ctx.globalAlpha = 1;
    ctx.fillStyle = C.bone;
    ctx.beginPath();
    ctx.arc(0, 0, 1.8, 0, TAU);
    ctx.fill();
    if (state.shield > 0) {
      ctx.strokeStyle = C.bone;
      ctx.globalAlpha = 0.55 + 0.3 * Math.sin(state.time * 5);
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.arc(0, 0, 20, 0, TAU);
      ctx.stroke();
      ctx.globalAlpha = 0.2;
      ctx.beginPath();
      ctx.arc(0, 0, 23, 0, TAU);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    if (player.focus) {
      ctx.strokeStyle = C.bone;
      ctx.globalAlpha = 0.9;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, TAU);
      ctx.stroke();
      ctx.globalAlpha = 0.16;
      ctx.beginPath();
      ctx.arc(0, 0, 27, 0, TAU);
      ctx.stroke();
    }
    ctx.restore();
  }
  function drawBanner() {
    if (!state.banner) return;
    const b = state.banner;
    const t = clamp(b.life / b.max, 0, 1);
    const alpha = t > 0.72 ? (1 - t) / 0.28 : Math.min(1, t / 0.35);
    const a = clamp(alpha, 0, 1);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.globalAlpha = a * 0.94;
    ctx.fillStyle = C.bone;
    ctx.font = '400 26px "Chakra Petch", "Microsoft YaHei", sans-serif';
    ctx.fillText(b.text, state.w / 2, state.h * 0.4);
    if (b.sub) {
      ctx.globalAlpha = a * 0.55;
      ctx.fillStyle = zoneNow().accent;
      ctx.font = '500 9px "Chakra Petch", "Microsoft YaHei", sans-serif';
      ctx.fillText(b.sub, state.w / 2, state.h * 0.4 + 24);
    }
    ctx.globalAlpha = a * 0.28;
    ctx.fillStyle = C.bone;
    ctx.fillRect(state.w / 2 - 40, state.h * 0.4 + 36, 80, 1);
    ctx.globalAlpha = 1;
  }
  function draw() {
    state.draws += 1;
    const t = state.dpr * state.scale;
    ctx.setTransform(t, 0, 0, t, 0, 0);
    ctx.save();
    if (state.shake > 0) {
      ctx.translate(rand(-state.shake, state.shake) * 0.35, rand(-state.shake, state.shake) * 0.35);
    }
    drawBackdrop();
    for (const e of enemies) drawEnemy(e);
    drawDrops();
    drawBullets();
    drawParticles();
    drawPopups();
    drawShip();
    drawBanner();
    ctx.restore();
    if (state.flash > 0) {
      ctx.setTransform(t, 0, 0, t, 0, 0);
      ctx.fillStyle = `rgba(255, 95, 109, ${state.flash * 0.15})`;
      ctx.fillRect(0, 0, state.w, state.h);
    }
    if (DBG) {
      let box = document.getElementById("dbg");
      if (!box) {
        box = document.createElement("pre");
        box.id = "dbg";
        box.style.cssText = "position:fixed;left:8px;top:64px;z-index:90;margin:0;padding:4px 6px;background:rgba(0,0,0,0.7);color:#9fe;font:10px monospace;white-space:pre";
        document.body.append(box);
      }
      box.textContent = `t=${state.time.toFixed(1)} ${state.mode} W${state.wave} e=${enemies.length} eb=${ebullets.length} pb=${pbullets.length} boss=${state.boss ? Math.round(state.boss.hp) : "-"} score=${state.score} p=${Math.round(player.x)},${Math.round(player.y)} up=${state.up.rate},${state.up.dmg},${state.up.stream} ${Math.round(state.w)}x${state.h} dpr=${state.dpr} canvas=${canvas.width}x${canvas.height} rz=${state.resizes} dr=${state.draws}`;
    }
  }
  function update(dt) {
    state.time += dt;
    updateBackdrop(dt, state.mode === "playing" ? 1 : 0.35);
    if (state.mode === "clear") {
      state.clearTimer -= dt;
      if (state.banner) {
        state.banner.life -= dt;
        if (state.banner.life <= 0) state.banner = null;
      }
      if (state.clearTimer <= 0) {
        state.mode = "playing";
        startWave(state.wave + 1);
      }
      return;
    }
    if (state.mode !== "playing") return;
    if (!state.pendingPick && state.pickQueue > 0) {
      openUpgrade();
      return;
    }
    state.threatTimer -= dt;
    if (state.threatTimer <= 0) {
      state.threatTimer = 0.45;
      state.threats = 0;
    }
    if (state.tipTimer > 0) {
      state.tipTimer -= dt;
      if (state.tipTimer <= 0) tipEl.hidden = true;
    }
    if (state.chainTimer > 0) {
      state.chainTimer -= dt;
      if (state.chainTimer <= 0) resetChain();
    }
    const hadBuff = state.buff.over > 0 || state.buff.slow > 0 || state.shield > 0;
    const overWas = state.buff.over;
    const slowWas = state.buff.slow;
    state.buff.over = Math.max(0, state.buff.over - dt);
    state.buff.slow = Math.max(0, state.buff.slow - dt);
    if (overWas > 0 && state.buff.over === 0) sfx.expire();
    if (slowWas > 0 && state.buff.slow === 0) sfx.expire();
    state.buffTick = (state.buffTick || 0) + dt;
    if (state.buffTick >= 0.2) {
      state.buffTick = 0;
      if (hadBuff || state.buff.over > 0 || state.buff.slow > 0) updateBuffs();
    }
    updatePlayer(dt);
    for (const e of enemies) updateEnemy(e, dt);
    enemies = enemies.filter((e) => !e.dead);
    updateBullets(dt);
    updateDrops(dt);
    collide();
    updateWave(dt);
    for (const p of particles) {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.98;
      p.vy *= 0.98;
    }
    particles = particles.filter((p) => p.life > 0);
    for (const p of popups) {
      p.y -= 22 * dt;
      p.life -= dt;
    }
    popups = popups.filter((p) => p.life > 0);
    if (state.boss) {
      const pct = clamp(state.boss.hp / state.boss.max, 0, 1);
      bosshp.style.width = `${(pct * 100).toFixed(1)}%`;
    }
    state.shake = Math.max(0, state.shake - dt * 36);
    state.flash = Math.max(0, state.flash - dt * 3);
    if (state.banner) {
      state.banner.life -= dt;
      if (state.banner.life <= 0) state.banner = null;
    }
  }
  var last = 0;
  function frame(now) {
    if (!last) last = now;
    const raw = clamp((now - last) / 1e3, 0, 0.05);
    last = now;
    if (SIM > 1) {
      const sub2 = 1 / 120 * SPEED;
      for (let i = 0; i < SIM; i += 1) update(sub2);
    } else {
      let dt = raw * SPEED;
      if (state.slow > 0) {
        state.slow = Math.max(0, state.slow - raw);
        dt *= 0.35;
      }
      update(dt);
    }
    draw();
    requestAnimationFrame(frame);
  }
  var fpsFrames = 0;
  var fpsAt = 0;
  function trackFps(now) {
    if (!DBG) return;
    fpsFrames += 1;
    if (!fpsAt) fpsAt = now;
    if (now - fpsAt >= 1e3) {
      document.title = `fps ${Math.round(fpsFrames * 1e3 / (now - fpsAt))}`;
      fpsFrames = 0;
      fpsAt = now;
    }
    requestAnimationFrame(trackFps);
  }
  var booted = false;
  async function boot(context) {
    if (booted) return;
    booted = true;
    if (context) applyHostReady(context, document.documentElement);
    bestEl.textContent = format(best);
    resize();
    bindEvents();
    syncSoundButton();
    updateHud();
    updatePower();
    toMenu();
    syncPauseButton();
    loadingEl.classList.add("done");
    if (STEPS > 0) {
      startRun();
      const force = PARAMS.get("drop");
      if (force && PICKUPS[force]) {
        dropPickup(player.x, player.y - 150, force);
      } else if (force === "all") {
        const ids = Object.keys(PICKUPS);
        ids.forEach((id, i) => dropPickup(state.w * (0.2 + i * 0.15), player.y - 170 - i % 2 * 40, id));
      }
      runSteps(STEPS);
    }
    if (TIMERS) {
      window.setInterval(() => {
        for (let i = 0; i < SIM; i += 1) update(1 / 60 * SPEED);
        draw();
      }, 16);
    } else {
      requestAnimationFrame(frame);
    }
    if (DBG) requestAnimationFrame(trackFps);
    void loadBest();
    void loadSoundPref();
    void loadWave();
    if (AUTOPILOT) {
      window.setTimeout(() => {
        if (state.mode === "menu") startRun();
      }, 260);
    }
  }
  try {
    host.onReady((context) => {
      applyHostReady(context, document.documentElement);
      void boot(context);
    });
  } catch {
  }
  window.setTimeout(() => void boot(null), 220);
})();

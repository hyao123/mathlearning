(function attachStudentProfiles(root) {
  const metaStorageKey = "mathlearning-student-profiles-v1";
  const globalProgressKey = "mathlearning-progress-v2";
  const defaultProfile = { id: "default", name: "默认学生" };

  const storageGetItem = root.Storage?.prototype?.getItem;
  const storageSetItem = root.Storage?.prototype?.setItem;
  const storageRemoveItem = root.Storage?.prototype?.removeItem;

  function safeParse(value, fallback) {
    try {
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function normalizeProfile(profile) {
    return {
      id: String(profile.id || "").trim() || createProfileId(profile.name || defaultProfile.name),
      name: String(profile.name || "").trim() || defaultProfile.name,
      createdAt: profile.createdAt || new Date().toISOString()
    };
  }

  function createProfileId(name) {
    const base = String(name || "student")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\u4e00-\u9fa5-]/g, "")
      .slice(0, 32);
    return `${base || "student"}-${Date.now().toString(36)}`;
  }

  function readMeta() {
    const raw = storageGetItem?.call(root.localStorage, metaStorageKey);
    const parsed = safeParse(raw, null);
    if (!parsed || !Array.isArray(parsed.profiles) || parsed.profiles.length === 0) {
      return {
        activeProfileId: defaultProfile.id,
        profiles: [normalizeProfile(defaultProfile)]
      };
    }

    const profiles = parsed.profiles.map(normalizeProfile);
    const activeProfileId = profiles.some((profile) => profile.id === parsed.activeProfileId)
      ? parsed.activeProfileId
      : profiles[0].id;
    return { activeProfileId, profiles };
  }

  function writeMeta(meta) {
    storageSetItem?.call(root.localStorage, metaStorageKey, JSON.stringify(meta));
  }

  function getProfiles() {
    return readMeta().profiles;
  }

  function getActiveProfile() {
    const meta = readMeta();
    return meta.profiles.find((profile) => profile.id === meta.activeProfileId) || meta.profiles[0];
  }

  function setActiveProfile(profileId) {
    const meta = readMeta();
    if (!meta.profiles.some((profile) => profile.id === profileId)) {
      return getActiveProfile();
    }
    const nextMeta = { ...meta, activeProfileId: profileId };
    writeMeta(nextMeta);
    return nextMeta.profiles.find((profile) => profile.id === profileId);
  }

  function addProfile(name) {
    const cleanName = String(name || "").trim();
    if (!cleanName) {
      return getActiveProfile();
    }
    const meta = readMeta();
    const profile = normalizeProfile({ id: createProfileId(cleanName), name: cleanName });
    const nextMeta = {
      activeProfileId: profile.id,
      profiles: [...meta.profiles, profile]
    };
    writeMeta(nextMeta);
    return profile;
  }

  function getProgressStorageKey(profileId = getActiveProfile().id) {
    return `${globalProgressKey}::student:${profileId}`;
  }

  function rewriteProgressKey(key) {
    return key === globalProgressKey ? getProgressStorageKey() : key;
  }

  function installStorageMapping() {
    if (!storageGetItem || !storageSetItem || !storageRemoveItem || root.__mathLearningStudentProfilesInstalled) {
      return;
    }
    root.__mathLearningStudentProfilesInstalled = true;

    root.Storage.prototype.getItem = function getItemWithStudentProfile(key) {
      if (this !== root.localStorage || key !== globalProgressKey) {
        return storageGetItem.call(this, key);
      }
      const profileKey = getProgressStorageKey();
      const profileValue = storageGetItem.call(this, profileKey);
      if (profileValue) {
        return profileValue;
      }
      return getActiveProfile().id === defaultProfile.id ? storageGetItem.call(this, globalProgressKey) : null;
    };

    root.Storage.prototype.setItem = function setItemWithStudentProfile(key, value) {
      return storageSetItem.call(this, this === root.localStorage ? rewriteProgressKey(key) : key, value);
    };

    root.Storage.prototype.removeItem = function removeItemWithStudentProfile(key) {
      return storageRemoveItem.call(this, this === root.localStorage ? rewriteProgressKey(key) : key);
    };
  }

  function createProfileSelect() {
    const select = document.createElement("select");
    select.className = "student-profile-select";
    getProfiles().forEach((profile) => {
      const option = document.createElement("option");
      option.value = profile.id;
      option.textContent = profile.name;
      option.selected = profile.id === getActiveProfile().id;
      select.appendChild(option);
    });
    select.addEventListener("change", () => {
      setActiveProfile(select.value);
      root.location.reload();
    });
    return select;
  }

  function renderProfileSwitcher() {
    if (typeof document === "undefined" || document.querySelector(".student-profile-switcher")) {
      return;
    }
    const heroContent = document.querySelector(".hero__content");
    if (!heroContent) {
      return;
    }

    const wrapper = document.createElement("section");
    wrapper.className = "student-profile-switcher";
    const label = document.createElement("label");
    const labelText = document.createElement("span");
    labelText.textContent = "当前学生";
    label.append(labelText, createProfileSelect());

    const addButton = document.createElement("button");
    addButton.type = "button";
    addButton.className = "button button--small button--ghost";
    addButton.textContent = "新增学生";
    addButton.addEventListener("click", () => {
      const name = root.prompt("请输入学生姓名或昵称");
      if (!name?.trim()) {
        return;
      }
      addProfile(name);
      root.location.reload();
    });

    const hint = document.createElement("p");
    hint.className = "muted";
    hint.textContent = "不同学生的进度、错题本、每日一练会分别保存。";
    wrapper.append(label, addButton, hint);
    heroContent.insertBefore(wrapper, heroContent.querySelector(".experience-panel") || null);
  }

  function boot() {
    renderProfileSwitcher();
  }

  installStorageMapping();

  const api = {
    addProfile,
    getActiveProfile,
    getProfiles,
    getProgressStorageKey,
    setActiveProfile,
    _createProfileId: createProfileId,
    _readMeta: readMeta
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  root.StudentProfiles = api;

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", boot);
    } else {
      boot();
    }
  }
})(typeof window !== "undefined" ? window : globalThis);

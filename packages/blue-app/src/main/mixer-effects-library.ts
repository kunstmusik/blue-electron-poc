import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { randomUUID } from 'crypto';

import { Element, Effect, UDOStyle } from '@blue/data';
import {
  applyEffectEditablePatchToEffect,
  createEffectEditorSnapshot,
  createLibraryEffectSnapshot,
  type EffectEditorRequest,
  type EffectEditorSnapshot,
  type EffectEditablePatch,
  type EffectsLibraryCategorySnapshot,
  type EffectsLibraryPatch,
  type EffectsLibrarySnapshot,
  type LibraryEffectSnapshot,
} from '../shared/project-editor';

interface LibraryEffectNode {
  effectId: string;
  effect: Effect;
}

interface LibraryCategoryNode {
  categoryId: string;
  name: string;
  isRoot: boolean;
  categories: LibraryCategoryNode[];
  effects: LibraryEffectNode[];
}

function createDefaultRootCategory(): LibraryCategoryNode {
  return {
    categoryId: randomUUID(),
    name: 'Effects Library',
    isRoot: true,
    categories: [],
    effects: [],
  };
}

function cloneEffect(effect: Effect): Effect {
  return Effect.loadFromXML(effect.saveAsXML());
}

function rebuildCategoryFromSnapshot(snapshot: EffectsLibraryCategorySnapshot): LibraryCategoryNode {
  const category: LibraryCategoryNode = {
    categoryId: randomUUID(),
    name: snapshot.name,
    isRoot: false,
    categories: snapshot.categories.map((child) => rebuildCategoryFromSnapshot(child)),
    effects: snapshot.effects.map((effectSnap) => {
      const effect = Effect.loadFromXML(Element.parse(effectSnap.effectXml));
      return createEffectNode(effect);
    }),
  };
  return category;
}

function createEffectNode(effect: Effect, effectId?: string): LibraryEffectNode {
  return {
    effectId: effectId ?? randomUUID(),
    effect,
  };
}

function buildCategorySnapshot(
  category: LibraryCategoryNode,
): EffectsLibraryCategorySnapshot {
  return {
    categoryId: category.categoryId,
    name: category.name,
    categories: category.categories.map((child) => buildCategorySnapshot(child)),
    effects: category.effects.map((entry) =>
      createLibraryEffectSnapshot(entry.effect, entry.effectId, category.categoryId),
    ),
  };
}

function parseCategoryElement(data: Element, isRoot = false): LibraryCategoryNode {
  const categoryName = data.getAttribute('categoryName') ?? data.getTextString('categoryName') ?? (isRoot ? 'Effects Library' : 'New Effect Category');
  const category: LibraryCategoryNode = {
    categoryId: randomUUID(),
    name: categoryName,
    isRoot,
    categories: [],
    effects: [],
  };

  const subCategories = data.getElements('effectCategory');
  while (subCategories.hasMoreElements()) {
    category.categories.push(parseCategoryElement(subCategories.next(), false));
  }

  const effects = data.getElements('effect');
  while (effects.hasMoreElements()) {
    category.effects.push(createEffectNode(Effect.loadFromXML(effects.next())));
  }

  return category;
}

function serializeCategory(category: LibraryCategoryNode): Element {
  const elem = new Element('effectCategory');
  elem.setAttribute('categoryName', category.name);
  elem.setAttribute('isRoot', String(category.isRoot));

  for (const child of category.categories) {
    elem.addElement(serializeCategory(child));
  }

  for (const effect of category.effects) {
    elem.addElement(effect.effect.saveAsXML().setName('effect'));
  }

  return elem;
}

function findCategoryWithParent(
  category: LibraryCategoryNode,
  categoryId: string,
): { parent: LibraryCategoryNode | null; category: LibraryCategoryNode | null } {
  if (category.categoryId === categoryId) {
    return { parent: null, category };
  }

  for (const child of category.categories) {
    if (child.categoryId === categoryId) {
      return { parent: category, category: child };
    }

    const result = findCategoryWithParent(child, categoryId);
    if (result.category) {
      return result.parent ? result : { parent: category, category: result.category };
    }
  }

  return { parent: null, category: null };
}

function findEffectWithCategory(
  category: LibraryCategoryNode,
  effectId: string,
): { category: LibraryCategoryNode | null; effect: LibraryEffectNode | null } {
  for (const effect of category.effects) {
    if (effect.effectId === effectId) {
      return { category, effect };
    }
  }

  for (const child of category.categories) {
    const result = findEffectWithCategory(child, effectId);
    if (result.effect) {
      return result;
    }
  }

  return { category: null, effect: null };
}

function findEffectSnapshot(
  category: LibraryCategoryNode,
  effectId: string,
): LibraryEffectSnapshot | null {
  const result = findEffectWithCategory(category, effectId);
  if (!result.effect || !result.category) {
    return null;
  }

  return createLibraryEffectSnapshot(
    result.effect.effect,
    result.effect.effectId,
    result.category.categoryId,
  );
}

function ensureUniqueCategoryName(
  siblings: LibraryCategoryNode[],
  desiredName: string,
  skipId?: string,
): string {
  const trimmed = desiredName.trim() || 'New Effect Category';
  if (!siblings.some((category) => category.categoryId !== skipId && category.name === trimmed)) {
    return trimmed;
  }

  let index = 2;
  let candidate = `${trimmed} ${index}`;
  while (siblings.some((category) => category.categoryId !== skipId && category.name === candidate)) {
    index += 1;
    candidate = `${trimmed} ${index}`;
  }
  return candidate;
}

function ensureUniqueEffectName(
  siblings: LibraryEffectNode[],
  desiredName: string,
  skipId?: string,
): string {
  const trimmed = desiredName.trim() || 'New Effect';
  if (!siblings.some((effect) => effect.effectId !== skipId && effect.effect.getName() === trimmed)) {
    return trimmed;
  }

  let index = 2;
  let candidate = `${trimmed} ${index}`;
  while (siblings.some((effect) => effect.effectId !== skipId && effect.effect.getName() === candidate)) {
    index += 1;
    candidate = `${trimmed} ${index}`;
  }
  return candidate;
}

function loadLibraryFromPath(libraryPath: string): {
  loaded: boolean;
  loadError?: string;
  root: LibraryCategoryNode;
} {
  if (!fs.existsSync(libraryPath)) {
    return {
      loaded: false,
      root: createDefaultRootCategory(),
    };
  }

  try {
    const xml = fs.readFileSync(libraryPath, 'utf-8');
    const parsed = Element.parse(xml);
    const rootCategoryElement =
      parsed.getName() === 'effectCategory'
        ? parsed
        : parsed.getElement('effectCategory');

    if (!rootCategoryElement) {
      return {
        loaded: false,
        loadError: 'effectsLibrary.xml did not contain a root effectCategory element.',
        root: createDefaultRootCategory(),
      };
    }

    return {
      loaded: true,
      root: parseCategoryElement(rootCategoryElement, true),
    };
  } catch (error: unknown) {
    return {
      loaded: false,
      loadError: error instanceof Error ? error.message : String(error),
      root: createDefaultRootCategory(),
    };
  }
}

export function getDefaultEffectsLibraryPath(): string {
  return path.join(os.homedir(), '.blue', 'effectsLibrary.xml');
}

export class MixerEffectsLibrarySession {
  private readonly libraryPath: string;
  private root: LibraryCategoryNode = createDefaultRootCategory();
  private loaded = false;
  private loadError: string | undefined;

  constructor(options?: { libraryPath?: string }) {
    this.libraryPath = options?.libraryPath ?? getDefaultEffectsLibraryPath();
    this.reload();
  }

  getSnapshot(): EffectsLibrarySnapshot {
    return {
      loaded: this.loaded,
      sourcePath: this.libraryPath,
      loadError: this.loadError,
      root: buildCategorySnapshot(this.root),
    };
  }

  reload(): EffectsLibrarySnapshot {
    const result = loadLibraryFromPath(this.libraryPath);
    this.loaded = result.loaded;
    this.loadError = result.loadError;
    this.root = result.root;
    return this.getSnapshot();
  }

  getEffectSnapshot(effectId: string): LibraryEffectSnapshot | null {
    return findEffectSnapshot(this.root, effectId);
  }

  getEffectEditorSnapshot(request: EffectEditorRequest): EffectEditorSnapshot | null {
    if (request.ownerType !== 'library') {
      return null;
    }

    const effectSnapshot = this.getEffectSnapshot(request.effectId);
    if (!effectSnapshot) {
      return null;
    }

    const effect = this.findEffectById(request.effectId);
    if (!effect) {
      return null;
    }

    return createEffectEditorSnapshot(effect, request.effectId, 'library', {
      libraryRef: { libraryEffectId: request.effectId },
    });
  }

  updateEffect(effectId: string, patch: EffectEditablePatch): LibraryEffectSnapshot | null {
    const effect = this.findEffectById(effectId);
    const category = this.findCategoryForEffect(effectId);
    if (!effect || !category) {
      return null;
    }

    applyEffectEditablePatchToEffect(effect, patch);
    return createLibraryEffectSnapshot(effect, effectId, category.categoryId);
  }

  applyPatch(patch: EffectsLibraryPatch): EffectsLibrarySnapshot {
    switch (patch.type) {
      case 'addCategory': {
        const parent =
          patch.parentCategoryId
            ? this.findCategoryById(patch.parentCategoryId)
            : this.root;
        if (!parent) {
          break;
        }

        const category: LibraryCategoryNode = {
          categoryId: patch.categoryId ?? randomUUID(),
          name: ensureUniqueCategoryName(parent.categories, patch.name ?? 'New Effect Category'),
          isRoot: false,
          categories: [],
          effects: [],
        };
        const insertIndex =
          patch.insertIndex === undefined
            ? parent.categories.length
            : Math.min(Math.max(patch.insertIndex, 0), parent.categories.length);
        parent.categories.splice(insertIndex, 0, category);
        break;
      }
      case 'renameCategory': {
        const category = this.findCategoryById(patch.categoryId);
        if (category) {
          const parent = this.findParentCategory(patch.categoryId);
          const siblings = parent?.categories ?? [this.root];
          category.name = ensureUniqueCategoryName(siblings, patch.name, patch.categoryId);
        }
        break;
      }
      case 'reorderCategory': {
        const parent =
          patch.parentCategoryId
            ? this.findCategoryById(patch.parentCategoryId)
            : this.root;
        if (!parent) {
          break;
        }

        if (
          patch.from >= 0 &&
          patch.from < parent.categories.length &&
          patch.to >= 0 &&
          patch.to < parent.categories.length &&
          patch.from !== patch.to
        ) {
          const [moved] = parent.categories.splice(patch.from, 1);
          parent.categories.splice(patch.to, 0, moved);
        }
        break;
      }
      case 'removeCategory': {
        const parent = this.findParentCategory(patch.categoryId);
        if (parent) {
          const index = parent.categories.findIndex((child) => child.categoryId === patch.categoryId);
          if (index >= 0) {
            parent.categories.splice(index, 1);
          }
        }
        break;
      }
      case 'renameEffect': {
        const result = this.findEffectWithParent(patch.effectId);
        if (result.effect && result.parent) {
          result.effect.effect.setName(
            ensureUniqueEffectName(result.parent.effects, patch.name, patch.effectId),
          );
        }
        break;
      }
      case 'duplicateEffect': {
        const result = this.findEffectWithParent(patch.effectId);
        if (result.effect && result.parent) {
          const duplicate = createEffectNode(
            cloneEffect(result.effect.effect),
            patch.libraryEffectId ?? randomUUID(),
          );
          duplicate.effect.setName(
            ensureUniqueEffectName(
              result.parent.effects,
              `${result.effect.effect.getName()} Copy`,
            ),
          );

          const insertIndex =
            patch.insertIndex === undefined
              ? result.parent.effects.length
              : Math.min(Math.max(patch.insertIndex, 0), result.parent.effects.length);
          result.parent.effects.splice(insertIndex, 0, duplicate);
        }
        break;
      }
      case 'addEffect': {
        const parent =
          patch.parentCategoryId
            ? this.findCategoryById(patch.parentCategoryId)
            : this.root;
        if (!parent) {
          break;
        }

        const effect = new Effect();
        if (patch.style) {
          effect.setStyle(UDOStyle[patch.style as keyof typeof UDOStyle]);
        }
        const effectNode = createEffectNode(effect, patch.effectId);
        effectNode.effect.setName(
          ensureUniqueEffectName(parent.effects, patch.name ?? 'New Effect'),
        );
        const insertIndex =
          patch.insertIndex === undefined
            ? parent.effects.length
            : Math.min(Math.max(patch.insertIndex, 0), parent.effects.length);
        parent.effects.splice(insertIndex, 0, effectNode);
        break;
      }
      case 'pasteCategory': {
        const parent =
          patch.parentCategoryId
            ? this.findCategoryById(patch.parentCategoryId)
            : this.root;
        if (!parent) {
          break;
        }

        parent.categories.push(rebuildCategoryFromSnapshot(patch.sourceSnapshot));
        break;
      }
      case 'pasteEffect': {
        const parent =
          patch.parentCategoryId
            ? this.findCategoryById(patch.parentCategoryId)
            : this.root;
        if (!parent) {
          break;
        }

        const effect = Effect.loadFromXML(Element.parse(patch.sourceEffect.effectXml));
        const effectNode = createEffectNode(effect);
        effectNode.effect.setName(
          ensureUniqueEffectName(parent.effects, patch.sourceEffect.name),
        );
        parent.effects.push(effectNode);
        break;
      }
      case 'moveNode': {
        const targetParent =
          patch.targetParentCategoryId
            ? this.findCategoryById(patch.targetParentCategoryId)
            : this.root;
        if (!targetParent) break;

        const effectResult = this.findEffectWithParent(patch.nodeId);
        if (effectResult.effect && effectResult.parent) {
          const idx = effectResult.parent.effects.findIndex((e) => e.effectId === patch.nodeId);
          if (idx >= 0) {
            const [removed] = effectResult.parent.effects.splice(idx, 1);
            const insertIdx = Math.min(Math.max(patch.targetIndex, 0), targetParent.effects.length);
            targetParent.effects.splice(insertIdx, 0, removed);
          }
          break;
        }

        const catResult = findCategoryWithParent(this.root, patch.nodeId);
        if (catResult.category && catResult.parent) {
          const idx = catResult.parent.categories.findIndex((c) => c.categoryId === patch.nodeId);
          if (idx >= 0) {
            const [removed] = catResult.parent.categories.splice(idx, 1);
            const insertIdx = Math.min(Math.max(patch.targetIndex, 0), targetParent.categories.length);
            targetParent.categories.splice(insertIdx, 0, removed);
          }
        }
        break;
      }
      case 'removeEffect': {
        const result = this.findEffectWithParent(patch.effectId);
        if (result.parent) {
          const index = result.parent.effects.findIndex((effect) => effect.effectId === patch.effectId);
          if (index >= 0) {
            result.parent.effects.splice(index, 1);
          }
        }
        break;
      }
      case 'updateEffect':
        this.updateEffect(patch.effectId, patch.patch);
        break;
    }

    return this.getSnapshot();
  }

  serializeCurrentState(): string {
    const root = new Element('effectsLibrary');
    root.addElement(serializeCategory(this.root));
    return root.toXml();
  }

  importEffectFromXml(effectXml: string, parentCategoryId?: string): EffectsLibrarySnapshot {
    const parent =
      parentCategoryId
        ? this.findCategoryById(parentCategoryId)
        : this.root;
    if (!parent) return this.getSnapshot();

    const effect = Effect.loadFromXML(Element.parse(effectXml));
    const effectNode = createEffectNode(effect);
    effectNode.effect.setName(
      ensureUniqueEffectName(parent.effects, effect.getName() || 'Imported Effect'),
    );
    parent.effects.push(effectNode);
    return this.getSnapshot();
  }

  exportEffectToXml(effectId: string): string | null {
    const effect = this.findEffectById(effectId);
    if (!effect) return null;
    return effect.saveAsXML().toXml();
  }

  findEffectForExport(effectId: string): Effect | null {
    return this.findEffectById(effectId);
  }

  private findCategoryById(categoryId: string): LibraryCategoryNode | null {
    return this.findCategoryRecursive(this.root, categoryId);
  }

  private findCategoryRecursive(
    current: LibraryCategoryNode,
    categoryId: string,
  ): LibraryCategoryNode | null {
    if (current.categoryId === categoryId) {
      return current;
    }

    for (const child of current.categories) {
      const found = this.findCategoryRecursive(child, categoryId);
      if (found) {
        return found;
      }
    }

    return null;
  }

  private findParentCategory(categoryId: string): LibraryCategoryNode | null {
    return this.findParentCategoryRecursive(this.root, categoryId);
  }

  private findParentCategoryRecursive(
    current: LibraryCategoryNode,
    categoryId: string,
  ): LibraryCategoryNode | null {
    for (const child of current.categories) {
      if (child.categoryId === categoryId) {
        return current;
      }

      const found = this.findParentCategoryRecursive(child, categoryId);
      if (found) {
        return found;
      }
    }

    return null;
  }

  private findEffectById(effectId: string): Effect | null {
    return this.findEffectWithParent(effectId).effect?.effect ?? null;
  }

  private findCategoryForEffect(effectId: string): LibraryCategoryNode | null {
    return this.findEffectWithParent(effectId).parent;
  }

  private findEffectWithParent(effectId: string): {
    parent: LibraryCategoryNode | null;
    effect: LibraryEffectNode | null;
  } {
    const result = this.findEffectWithParentRecursive(this.root, effectId);
    return result ?? { parent: null, effect: null };
  }

  private findEffectWithParentRecursive(
    current: LibraryCategoryNode,
    effectId: string,
  ): { parent: LibraryCategoryNode | null; effect: LibraryEffectNode | null } | null {
    for (const effect of current.effects) {
      if (effect.effectId === effectId) {
        return { parent: current, effect };
      }
    }

    for (const child of current.categories) {
      const found = this.findEffectWithParentRecursive(child, effectId);
      if (found) {
        return found;
      }
    }

    return null;
  }
}

let defaultSession: MixerEffectsLibrarySession | null = null;

export function getMixerEffectsLibrarySession(): MixerEffectsLibrarySession {
  if (!defaultSession) {
    defaultSession = new MixerEffectsLibrarySession();
  }

  return defaultSession;
}


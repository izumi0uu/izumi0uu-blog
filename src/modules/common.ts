import { getCollection } from "astro:content";

import { isProd } from "@/utils/system/environment";
import { isPreviewMode } from "@/utils/system/preview";

import type { CollectionEntry, CollectionKey } from "astro:content";

/*-------------------------------- all entries ------------------------------*/

export interface GetAllEntriesOptions {
  skipSort?: boolean;
  includeDrafts?: boolean;
}

/**
 * Sorts by publishDate desc by default. Newest on top.
 * Omits drafts by default - set by PREVIEW_MODE env var.
 *
 * ONLY place to filter draft posts and projects.
 */
const getAllEntries = async <T extends CollectionKey>(
  collectionName: T,
  options?: GetAllEntriesOptions
): Promise<CollectionEntry<T>[]> => {
  const { skipSort = false, includeDrafts = isPreviewMode() } = options ?? {};

  const entries = await getCollection<T>(collectionName, ({ data }) => {
    const isProdAndDraft = isProd && data.draft;
    return !isProdAndDraft || includeDrafts;
  });

  if (skipSort) return entries;

  const sortedEntries = sortEntriesByDateDesc(entries);
  return sortedEntries;
};

/*-------------------------- sort by updatedDate or publishDate ------------------------*/

// just for sorting
const getEntryLastDate = <T extends CollectionKey>(entry: CollectionEntry<T>): Date =>
  entry.data.updatedDate ?? entry.data.publishDate;

const sortEntriesByDateDesc = <T extends CollectionKey>(entries: CollectionEntry<T>[]) =>
  entries.slice().sort((a, b) => getEntryLastDate(b).valueOf() - getEntryLastDate(a).valueOf());

/*------------------------- lastAccessDate for components -----------------------*/

interface EntryDates {
  publishDate: Date;
  updatedDate?: Date;
}
interface EntryDatesResult {
  lastAccessDate: Date;
  isUpdatedDate: boolean;
}

const getPublishedOrUpdatedDate = ({ publishDate, updatedDate }: EntryDates): EntryDatesResult => {
  const result = {
    lastAccessDate: updatedDate ?? publishDate,
    isUpdatedDate: Boolean(updatedDate),
  };

  return result;
};

/*------------------------- for content layer -----------------------*/

/**
 * 将ID转换为slug
 * @param item 包含id属性的对象
 * @returns 添加了slug属性的对象
 */
const idToSlug = <T extends { id: string }>(item: T): T & { slug: string } => {
  // 移除.mdx后缀并进行其他清理
  const cleanSlug = item.id.replace(/\.mdx$/, "");

  return {
    ...item,
    slug: cleanSlug,
  };
};

export {
  getAllEntries,
  getEntryLastDate,
  sortEntriesByDateDesc,
  getPublishedOrUpdatedDate,
  idToSlug,
  type EntryDates,
  type EntryDatesResult,
};

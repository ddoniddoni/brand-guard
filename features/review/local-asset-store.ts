const databaseName = "brandguard.assets.v1";
const databaseVersion = 1;
const imageStoreName = "review-images";

type ReviewImageAsset = {
  dataUrl: string;
  imageId: string;
  reviewJobId: string;
  updatedAt: string;
};

export class ReviewStorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReviewStorageError";
  }
}

export async function saveReviewAssets(
  assets: Array<Omit<ReviewImageAsset, "updatedAt">>,
) {
  if (assets.length === 0) {
    return;
  }

  const database = await openDatabase();

  try {
    const transaction = database.transaction(imageStoreName, "readwrite");
    const completed = waitForTransaction(transaction);
    const store = transaction.objectStore(imageStoreName);
    const timestamp = new Date().toISOString();

    await Promise.all(
      assets.map((asset) =>
        waitForRequest(
          store.put({
            ...asset,
            updatedAt: timestamp,
          } satisfies ReviewImageAsset),
        ),
      ),
    );
    await completed;
  } catch (error) {
    throw toReviewStorageError(error);
  } finally {
    database.close();
  }
}

export async function getReviewAssetDataUrls(imageIds: string[]) {
  const dataUrls = new Map<string, string>();

  if (imageIds.length === 0) {
    return dataUrls;
  }

  const database = await openDatabase();

  try {
    const transaction = database.transaction(imageStoreName, "readonly");
    const completed = waitForTransaction(transaction);
    const store = transaction.objectStore(imageStoreName);
    const assets = await Promise.all(
      imageIds.map((imageId) =>
        waitForRequest<ReviewImageAsset | undefined>(store.get(imageId)),
      ),
    );
    await completed;

    assets.forEach((asset) => {
      if (asset) {
        dataUrls.set(asset.imageId, asset.dataUrl);
      }
    });

    return dataUrls;
  } catch (error) {
    throw toReviewStorageError(error);
  } finally {
    database.close();
  }
}

export async function deleteReviewAssets(imageIds: string[]) {
  if (imageIds.length === 0 || typeof window === "undefined") {
    return;
  }

  let database: IDBDatabase | null = null;

  try {
    database = await openDatabase();
    const transaction = database.transaction(imageStoreName, "readwrite");
    const completed = waitForTransaction(transaction);
    const store = transaction.objectStore(imageStoreName);

    await Promise.all(imageIds.map((imageId) => waitForRequest(store.delete(imageId))));
    await completed;
  } catch {
    // Cleanup is best-effort after a metadata persistence failure.
  } finally {
    database?.close();
  }
}

function openDatabase() {
  if (typeof window === "undefined" || !window.indexedDB) {
    return Promise.reject(
      new ReviewStorageError(
        "이 브라우저에서는 이미지 저장소를 사용할 수 없습니다.",
      ),
    );
  }

  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(databaseName, databaseVersion);

    request.addEventListener("upgradeneeded", () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(imageStoreName)) {
        const store = database.createObjectStore(imageStoreName, {
          keyPath: "imageId",
        });
        store.createIndex("reviewJobId", "reviewJobId");
      }
    });
    request.addEventListener("success", () => resolve(request.result));
    request.addEventListener("error", () =>
      reject(toReviewStorageError(request.error)),
    );
  });
}

function waitForRequest<T = IDBValidKey>(request: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    request.addEventListener("success", () => resolve(request.result));
    request.addEventListener("error", () => reject(request.error));
  });
}

function waitForTransaction(transaction: IDBTransaction) {
  return new Promise<void>((resolve, reject) => {
    transaction.addEventListener("complete", () => resolve());
    transaction.addEventListener("abort", () => reject(transaction.error));
    transaction.addEventListener("error", () => reject(transaction.error));
  });
}

function toReviewStorageError(error: unknown) {
  if (error instanceof ReviewStorageError) {
    return error;
  }

  if (
    error instanceof DOMException &&
    ["QuotaExceededError", "UnknownError"].includes(error.name)
  ) {
    return new ReviewStorageError(
      "브라우저 저장 공간이 부족합니다. 기존 검수 기록이나 큰 이미지를 정리해 주세요.",
    );
  }

  return new ReviewStorageError(
    "검수 결과를 저장하지 못했습니다. 브라우저 저장소 설정을 확인해 주세요.",
  );
}

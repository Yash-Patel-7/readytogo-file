import async from 'async';
import fs from 'fs/promises';
import { resolve as absPath, dirname } from 'path';

class File {
	private static _files: Map<string, File> = new Map();
	private _path: string;
	private _queue: async.QueueObject<() => Promise<void>>;

	private constructor(path: string) {
		this._path = path;
		this._queue = async.queue(async (task, callback) => {
			try {
				await task();
				callback();
			} catch (error) {
				if (error instanceof Error) {
					callback(error);
				} else {
					callback(new Error("UNEXPECTED"));
				}
			}
		}, 1);
	}

	public static instanceofFile = (arg: unknown): arg is File => {
		return arg instanceof File;
	}

	public static getFile = (path: string): File => {
		path = absPath(path);
		const files = File._files;
		if (files.has(path) === false) files.set(path, new File(path));
		const file = files.get(path);
		if (typeof file === 'undefined') throw new Error('UNEXPECTED');
		return file;
	}

	public create = (): Promise<void> => {
		return new Promise((resolve, reject) => {
			this._queue.push(async () => {
				try {
					await fs.mkdir(dirname(this._path), { recursive: true });
					const fileHandle = await fs.open(this._path, 'wx');
					await fileHandle.close();
					resolve();
				} catch (error) {
					if (typeof error === 'object' && error !== null) {
						if ('code' in error && typeof error.code === 'string') {
							if (error.code === 'EEXIST') {
								resolve();
								return;
							}
							reject(new Error(error.code));
							throw new Error(error.code);
						}
					}
					reject(new Error('UNEXPECTED'));
					throw new Error('UNEXPECTED');
				}
			});
		});
	}

	public delete = (): Promise<void> => {
		return new Promise((resolve, reject) => {
			this._queue.push(async () => {
				try {
					await fs.unlink(this._path);
					resolve();
				} catch (error) {
					if (typeof error === 'object' && error !== null) {
						if ('code' in error && typeof error.code === 'string') {
							if (error.code === 'ENOENT') {
								resolve();
								return;
							}
							reject(new Error(error.code));
							throw new Error(error.code);
						}
					}
					reject(new Error('UNEXPECTED'));
					throw new Error('UNEXPECTED');
				}
			});
		});
	}

	public read(encoding?: BufferEncoding): Promise<string>;
	public read(encoding: null): Promise<Buffer>;
	public read(encoding?: BufferEncoding | null): Promise<string | Buffer> {
		return new Promise((resolve, reject) => {
			this._queue.push(async () => {
				try {
					if (encoding === undefined) encoding = 'utf-8';
					resolve(await fs.readFile(this._path, encoding));
				} catch (error) {
					if (typeof error === 'object' && error !== null) {
						if ('code' in error && typeof error.code === 'string') {
							reject(new Error(error.code));
							throw new Error(error.code);
						}
					}
					reject(new Error('UNEXPECTED'));
					throw new Error('UNEXPECTED');
				}
			});
		});
	}

	public write = (data: string | Buffer, encoding?: BufferEncoding): Promise<void> => {
		return new Promise((resolve, reject) => {
			this._queue.push(async () => {
				try {
					await fs.writeFile(this._path, data, encoding);
					resolve();
				} catch (error) {
					if (typeof error === 'object' && error !== null) {
						if ('code' in error && typeof error.code === 'string') {
							reject(new Error(error.code));
							throw new Error(error.code);
						}
					}
					reject(new Error('UNEXPECTED'));
					throw new Error('UNEXPECTED');
				}
			});
		});
	}
}

const instanceofFile = File.instanceofFile;
const getFile = File.getFile;

export {
	instanceofFile,
	getFile
}

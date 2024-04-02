import { instanceofFile, getFile } from './index';
import { resolve as absPath } from 'path';

describe('instanceofFile', () => {
	const path = './tmp/instanceofFile.txt';

	it('should return true for an instance of File class', () => {
		const file = getFile(path);
		expect(instanceofFile(file)).toBe(true);
	});

	it('should return false for a string', () => {
		expect(instanceofFile(path)).toBe(false);
	});

	it('should return false for an instance of Array class', () => {
		const arr = new Array<number>(1, 2, 3);
		expect(instanceofFile(arr)).toBe(false);
	});
});

describe('getFile', () => {
	const path = './tmp/getFile.txt';

	it('should return the same instance for the same exact path', () => {
		const file1 = getFile(path);
		const file2 = getFile(path);
		expect(file1).toBe(file2);
	});

	it('should return the same instance for a relative and absolute path', () => {
		const file1 = getFile(path);
		const file2 = getFile(absPath(path));
		expect(file1).toBe(file2);
	});

	it('should return a different instance for a different path', () => {
		const file1 = getFile(path);
		const file2 = getFile(path + '2');
		expect(file1).not.toBe(file2);
	});
});

describe('file', () => {
	const path = './tmp/file.txt';

	it('should execute operations asynchronously in FIFO order', async () => {
		const file = getFile(path);
		file.create();
		for (let i = 0; i < 10; i++) {
			file.read();
			file.write(i.toString());
		}
		expect(await file.read()).toBe('9');
		await file.delete();
	});
});


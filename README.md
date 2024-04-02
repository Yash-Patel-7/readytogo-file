# readytogo-file
Safely perform async operations on the same file

## Usage

```javascript
import { instanceofFile, getFile } from '@readytogo/file';

const file = getFile('./data.txt');

instanceofFile(file); // returns true

file.read().then((data) => {
	console.log(data);
});

const newData = "new Data";

file.write(newData).then(() => {
	console.log("success");
});
```

## Note
If you used fs/promises directly, then the usage above would result in both read and write operations happening concurrently (asynchronously in small blocks). It would read a small block, write a small block, read, write, and result in unpredictable behavior. The write operation could complete before the read operation, resulting in a loss of data. For this reason, this module gives each file an asynchronous queue to process read/write operations in the order they are called, without blocking the event loop. This would make the usage above read the file completely first, then write the file completely. This still allows concurrent reading/writing of different files because there would be no race conditions. The instanceofFile() function is used to check if something is an instance of the File class. The getFile() function is used to get the instance associated with a file path. The file instance is a singleton, so calling getFile() with the same exact path will return the same instance. A relative path is resolved to an absolute path. If the current working directory is '/user', then getFile('./data.txt') will be resolved and saved as '/user/data.txt'. So, getFile('/user/data.txt') will return the same instance as getFile('./data.txt'). This guarantees that for any given file, there is only one instance with one asynchronous queue.


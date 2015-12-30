const ajax = (method, url, callback, responseFormatter) => {
  responseFormatter = responseFormatter || (r => r);
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = () => {
    if (xhr.readyState !== XMLHttpRequest.DONE) {
      return;
    }

    const response = xhr.responseText;
    if (!response.length) {
      return;
    }

    callback(xhr.status === 200 ? responseFormatter(xhr.responseText) : null);
  };
  xhr.open(method, url, true);
  xhr.send();
};

const get = (url, callback) => ajax('GET', url, callback, null);
const getJSON = (url, callback) => ajax('GET', url, callback, JSON.parse);

const http = {
  ajax,
  get,
  getJSON
};
export default http;

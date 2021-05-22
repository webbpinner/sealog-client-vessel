import path from 'path';
import { API_ROOT_URL, ROOT_PATH IMAGE_PATH } from './client_config';

// This function constructs a URL to an image served by the Sealog server.
// Normally, this should correspond to the server's IMAGE_ROUTE setting
// (defined in routes/default.js).
//
// Override this function to serve images through alternate methods, such as a
// caching proxy.
//
// Credit rgov (WHOIGit/ndsf-sealog-client)
function getImageUrl(image_path) {
  return API_ROOT_URL + IMAGE_PATH + path.basename(image_path);
}

function handleMissingImage(ev) {
	ev.target.src = API_ROOT_URL + ROOT_PATH + 'images/noimage.jpeg';
}

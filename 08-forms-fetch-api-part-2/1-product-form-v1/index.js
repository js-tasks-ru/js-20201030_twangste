import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';
const API_PATH = '/api/rest';
const IMAGE_STORAGE_URL = 'https://api.imgur.com';

export default class ProductForm {
  subElements;
  defaultFormData = {
    title: '',
    description: '',
    quantity: 1,
    subcategory: '',
    status: 1,
    price: 100,
    discount: 0,
    images: []
  };

  constructor (productId) {
    this.categoryUrl = new URL(API_PATH + '/categories', BACKEND_URL);
    this.productUrl = new URL(API_PATH + '/products', BACKEND_URL);
    this.imageUploadUrl = new URL('/3/image', IMAGE_STORAGE_URL);

    this.productId = productId;
  }

  async loadCategories() {
    this.categoryUrl.searchParams.set('_sort', 'weight');
    this.categoryUrl.searchParams.set('_refs', 'subcategory');
    try {
      return await fetchJson(this.categoryUrl);
    }
    catch (e) {
      throw e;
    }
  }

  async loadProduct() {
    if (this.productId) {
      this.productUrl.searchParams.set('id', this.productId);
      try {
        const responseData = await fetchJson(this.productUrl);
        return (responseData.length) ? responseData[0] : this.defaultFormData;
      }
      catch (e) {
        throw e;
      }
    } else {
      return this.defaultFormData;
    }
  }

  getSubcategoriesList(subcategory) {
    const names = [];
    for (const category of this.categoriesData) {
      for (const child of category.subcategories) {
        names.push(this.getCategoryItem({
          id: child.id,
          selected: child.id === subcategory,
          title: `${category.title} > ${child.title}`
        }));
      }
    }
    return names.join('');
  }

  getCategoryItem(item) {
    const {id = '', title, selected = false} = item;
    return `
      <option value="${id}" ${selected ? 'selected' : ''}>${title}</option>
    `;
  }

  getImageList() {
    const images = this.productData.images || [];
    const list = [];
    for (let image of images) {
      list.push(this.getImageListItem(image));
    }
    return list.join('');
  }

  getImageListItem(item) {
    if (!item) {
      return `
        <li class="products-edit__imagelist-item sortable-list__item" style="">
          <span>
            <img src="icon-grab.svg" data-grab-handle="" alt="grab">
            <span>loading...</span>
          </span>
          <button type="button">
            <img src="icon-trash.svg" data-delete-handle="" alt="delete">
          </button>
        </li>`;
    }
    const {url, source} = item;
    return `
        <li class="products-edit__imagelist-item sortable-list__item" style="">
          <input type="hidden" name="url" value="${url}">
          <input type="hidden" name="source" value="${source}">
          <span>
            <img src="icon-grab.svg" data-grab-handle="" alt="grab">
            <img class="sortable-table__cell-img" alt="Image" src="${url}">
            <span>${source}</span>
          </span>
          <button type="button">
            <img src="icon-trash.svg" data-delete-handle="" alt="delete">
          </button>
        </li>`;
  }

  getTemplate() {
    const {
      title = '',
      description = '',
      quantity = '',
      subcategory = '',
      status = 1,
      price = 100,
      discount = 0
    } = this.productData;

    return `
    <div class="product-form">
    <form data-element="productForm" class="form-grid">
      <div class="form-group form-group__half_left">
        <fieldset>
          <label class="form-label">Название товара</label>
          <input required=""
                 type="text"
                 name="title"
                 id="title"
                 class="form-control"
                 placeholder="Название товара"
                 value='${title}'
          >
        </fieldset>
      </div>
      <div class="form-group form-group__wide">
        <label class="form-label">Описание</label>
        <textarea required=""
                  class="form-control"
                  name="description"
                  id="description"
                  data-element="productDescription"
                  placeholder="Описание товара"
        >${description}</textarea>
      </div>
      <div class="form-group form-group__wide" data-element="sortable-list-container">
        <label class="form-label">Фото</label>
        <div data-element="imageListContainer">
          <ul class="sortable-list">
            ${this.getImageList()}
          </ul>
        </div>
        <button type="button" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
      </div>
      <div class="form-group form-group__half_left">
        <label class="form-label">Категория</label>
        <select class="form-control" name="subcategory" id="subcategory">
          ${this.getSubcategoriesList(subcategory)}
        </select>
      </div>
      <div class="form-group form-group__half_left form-group__two-col">
        <fieldset>
          <label class="form-label">Цена ($)</label>
          <input required=""
                 type="number"
                 name="price"
                 id="price"
                 class="form-control"
                 placeholder="100"
                 value='${price}'
          >
        </fieldset>
        <fieldset>
          <label class="form-label">Скидка ($)</label>
          <input required=""
                 type="number"
                 name="discount"
                 id="discount"
                 class="form-control"
                 placeholder="0"
                 value="${discount}"
          >
        </fieldset>
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Количество</label>
        <input required=""
               type="number"
               class="form-control"
               name="quantity"
               id="quantity"
               placeholder="1"
               value="${quantity}"
        >
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Статус</label>
        <select class="form-control" name="status" id="status">
          <option value="1" ${status ? 'selected' : ''}>Активен</option>
          <option value="0" ${status ? '' : 'selected'}>Неактивен</option>
        </select>
      </div>
      <div class="form-buttons">
        <button type="submit" name="save" class="button-primary-outline">
          Сохранить товар
        </button>
      </div>
    </form>
  </div>
    `;
  }

  async render () {

    const [categoriesData, productData] = await Promise.all([
      this.loadCategories(),
      this.loadProduct()
    ]);
    this.categoriesData = categoriesData;
    this.productData = productData;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements(this.element);
    this.initEventListeners();
    return this.element;
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  onSubmit = (event) => {
    event.preventDefault();
    this.save();
  }

  save = async () => {
    const {productForm, imageListContainer} = this.subElements;
    const requestData = [...productForm.querySelectorAll('[required]')]
      .reduce((accum, {name, value, type}) => {
        accum[name] = (type === 'number') ? parseInt(value) : value;
        return accum;
      }, {});

    if (this.productId) {
      requestData.id = this.productId;
    }

    //TODO: Рассмотреть вариант получения данных из this.productData.images
    requestData.images = [...imageListContainer.querySelectorAll('li')]
      .map(item => {
        return {
          url: item.querySelector('[name=url]').value,
          source: item.querySelector('[name=source]').value
        };
      });

    requestData.subcategory = productForm.querySelector('[name=subcategory]').selectedOptions[0].value;

    try {
      for (let key of this.productUrl.searchParams.keys()) {
        this.productUrl.searchParams.delete(key);
      }

      const responseData = await fetchJson(this.productUrl, {
        method: this.productId ? 'PATCH' : 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      this.productData = requestData;
      this.productId = requestData.id;

      const productUpdatedEvent = new CustomEvent('product-updated', {bubbles: true, detail: responseData});
      this.element.dispatchEvent(productUpdatedEvent);
    }
    catch (e) {
      throw e;
    }

  }

  fileUpload = async (event) => {

    const element = event.target;

    const formData = new FormData();
    formData.append('image', element.files[0]);


    const imageElement = document.createElement('li');
    imageElement.innerHTML = this.getImageListItem();

    const imageList = this.subElements.imageListContainer.querySelector('ul');
    imageList.append(imageElement);

    try {
      const responseData = await fetchJson(this.imageUploadUrl, {
        method: 'POST',
        headers: {
          'authorization': `Client-ID ${IMGUR_CLIENT_ID}`
        },
        body: formData
      });
      if (responseData.status === 200 && responseData.data) {
        const newImageUrl = new URL(responseData.data.link);
        const image = {
          url: newImageUrl.toString(),
          source: newImageUrl.pathname.slice(1)
        };
        this.productData.images.push(image);
        imageElement.innerHTML = this.getImageListItem(image);
      }
    }
    catch (e) {
      imageElement.remove();
      throw e;
    }
    element.remove();
  }

  onUploadImage = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';

    fileInput.addEventListener('change', this.fileUpload);
    fileInput.click();
  }

  initEventListeners() {
    const productForm = this.subElements.productForm;
    const uploadImageButton = productForm.querySelector('button[name=uploadImage]');

    productForm.addEventListener('submit', this.onSubmit);
    uploadImageButton.addEventListener('click', this.onUploadImage);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.subElements = null;
  }
}

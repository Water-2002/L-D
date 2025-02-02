const storeName = 'l-d-technical-support-team';
const accessToken = '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';
const metafieldNamespace = "custom";
const metafieldKey = "comments"; 


const fetchMetaObject = async (handle, type) => {
  const endpoint = `https://${storeName}.myshopify.com/admin/api/2025-01/graphql.json`;

  const query = `
    query {
      metaobjectByHandle(handle: {handle: "${handle}", type: "${type}"}) {
        id
      }
    }
  `;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': accessToken,
    },
    body: JSON.stringify({ query: query }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const result = await response.json();
  console.log('MetaObject Data:', result);
  return result.data.metaobjectByHandle
};


const createMetaObject = async (type, fields) => {
  const endpoint = `https://${storeName}.myshopify.com/admin/api/2023-10/graphql.json`;
  const fieldsString = fields
      .map(field => `{ key: "${field.key}", value: "${field.value}" }`)
      .join(", ");
  const mutation = `
    mutation {
      metaobjectCreate(metaobject: {
        type: "${type}",
        fields: [${fieldsString}]
      }) {
        metaobject {
          id
          handle
          type
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
      body: JSON.stringify({ query: mutation }),
    });
    console.log('Response Status:', response.status);
    const result = await response.json();
    if (result.errors || result.data.metaobjectCreate.userErrors.length > 0) {
      console.error('Error creating MetaObject:', result.errors || result.data.metaobjectCreate.userErrors);
      return null;
    }

    return result.data.metaobjectCreate.metaobject;
};


const activeMetaObject = async (metaObjectId) => {
  const endpoint = `https://${storeName}.myshopify.com/admin/api/2025-01/graphql.json`;
 
    // Activate the MetaObject
  console.log('.',  metaObjectId)
  const activateMutation = `
    mutation {
      metaobjectUpdate(id: "${metaObjectId}", metaobject: { capabilities: { publishable: { status: ACTIVE } } }) {
        metaobject {
          id
          handle
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const activateResponse = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Shopify-Access-Token': accessToken,
    },
    body: JSON.stringify({ query: activateMutation }),
  });

  const activateResult = await activateResponse.json();
  if (activateResult.errors || activateResult.data.metaobjectUpdate.userErrors.length > 0) {
    console.error('Error activating MetaObject:', activateResult.errors || activateResult.data.metaobjectUpdate.userErrors);
    return null;
  }

  console.log('Activated MetaObject:', activateResult.data.metaobjectUpdate.metaobject);
  return activateResult.data.metaobjectUpdate.metaobject;

    return result.data.metaobjectCreate.metaobject;
};

const updateMetafield = async (productId, newMetaObjectId, key) => {
  const endpoint = `https://${storeName}.myshopify.com/admin/api/2025-01/graphql.json`;

  const getMetafieldQuery = `
      query {
        product(id: "${productId}") {
          metafield(namespace: "custom", key: "${key}") {
            id
            value
          }
        }
      }
    `;

    const getResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
      body: JSON.stringify({ query: getMetafieldQuery }),
    });

    const getResult = await getResponse.json();
    if (getResult.errors) {
      console.error('Error retrieving Metafield:', getResult.errors);
      return null;
    }

    const existingValue = JSON.parse(getResult.data.product.metafield.value || "[]");
    const updatedValue = [...existingValue, newMetaObjectId];
    for (let i = 0 ; i < existingValue ; i++) {
      if (existingValue == newMetaObjectId) {
        return false;
      }
    }
    console.log(updatedValue)
     const updateMutation = `
      mutation {
        metafieldsSet(metafields: [
          {
            ownerId: "${productId}",
            namespace: "custom",
            key: "${key}",
            type: "list.metaobject_reference",
            value: ${JSON.stringify(JSON.stringify(updatedValue))}
          }
        ]) {
          metafields {
            id
            namespace
            key
            value
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
      body: JSON.stringify({ query: updateMutation }),
    });

    const result = await response.json();

    if (result.errors) {
      console.error('Error updating Metafield:', result.errors || result.data.metafieldSet.userErrors);
      return null;
    }

    console.log('Updated Metafield:', result.data);
    return result.data.metafieldSet;
};

const isActiveButton = async (productId, newMetaObjectId, key) => {
  const endpoint = `https://${storeName}.myshopify.com/admin/api/2025-01/graphql.json`;

  const getMetafieldQuery = `
      query {
        product(id: "${productId}") {
          metafield(namespace: "custom", key: "${key}") {
            id
            value
          }
        }
      }
    `;

    const getResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
      body: JSON.stringify({ query: getMetafieldQuery }),
    });

    const getResult = await getResponse.json();
    if (getResult.errors) {
      console.error('Error retrieving Metafield:', getResult.errors);
      return false;
    }
    const existingValue = getResult.data.product.metafield ? getResult.data.product.metafield.value : [];
    console.log('existingValue', existingValue)
    for (let i = 0 ; i < existingValue ; i++) {
      if (existingValue[i] == newMetaObjectId) {
        return true;
      }
    }
    return false;
};

async function updateMetafieldInteger(productId, key, newValue) {
  const endpoint = `https://${storeName}.myshopify.com/admin/api/2025-01/graphql.json`;
  
 const updateMutation = `
      mutation {
        metafieldsSet(metafields: [
          {
            ownerId: "${productId}",
            namespace: "custom",
            key: "${key}",
            type: "number_integer",
            value: "${newValue}",
          }
        ]) {
          metafields {
            id
            namespace
            key
            value
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
      body: JSON.stringify({ query: updateMutation }),
    });

    const result = await response.json();

    if (result.errors) {
      console.error('Error updating Metafield:', result.errors || result.data.metafieldSet.userErrors);
      return null;
    }

    console.log('Updated Metafield:', result.data);
    return result.data.metafieldSet;
}


document.addEventListener("DOMContentLoaded", async () => {
  let sbBtn = document.querySelector('.btn-submit');
  let current = document.querySelector('html').getAttribute('account')
  let user;
  if (current) {
   user = current != 'none' ? await fetchMetaObject(current.toLowerCase(), 'author') : null;
  }
  sbBtn.addEventListener('click', async () => {
    let productId = `gid://shopify/Product/${sbBtn.getAttribute('product-id')}`;
    let content = document.querySelector('.comment-content').value;
    const formatDateToISO = (date) => {
      return date.toISOString().split('.')[0]; // Remove the milliseconds
    };
    console.log(content.trim())
    const now = new Date();
    const formattedDate = formatDateToISO(now);
    createMetaObject('comment', [
        { key: "owner", value: user.id },
        { key: "content", value: content.trim() },
        { key: "created_at", value: formattedDate }
      ]).then(async (metaobject) => {
        console.log('metaobject', metaobject)
        await activeMetaObject(metaobject.id);
        await updateMetafield(productId, metaobject.id, 'comments')
      });
  })

  let btnLike = document.querySelector('.btn-like')
  
  let isActiveLike = await isActiveButton(`gid://shopify/Product/${btnLike.getAttribute('product-id')}`, user.id, 'likes');

  if (isActiveButton) {
    btnLike.setAttribute('active', true)
  }

  btnLike.addEventListener('click', async () => {
      let productId = `gid://shopify/Product/${btnLike.getAttribute('product-id')}`;
      console.log('user', user.id)
      let rs = await updateMetafield(productId, user.id, 'likes')
      if (rs) {
        let number = document.querySelector('.total-like span').textContent;
        await updateMetafieldInteger(productId, 'total_like', +number + 1)
      }
  })
});

document.addEventListener("DOMContentLoaded", function () {
  const commentTimes = document.querySelectorAll('.comment-time');

  commentTimes.forEach(function (element) {
    const createdAt = new Date(element.getAttribute('data-created-at'));
    const now = new Date();
    const differenceInMs = now - createdAt; // Difference in milliseconds

    // Convert to human-readable time
    const minutesAgo = Math.floor(differenceInMs / 1000 / 60);
    const hoursAgo = Math.floor(minutesAgo / 60);
    const daysAgo = Math.floor(hoursAgo / 24);

    let relativeTime = '';
    if (minutesAgo < 1) {
      relativeTime = 'just now';
    } else if (minutesAgo < 60) {
      relativeTime = `${minutesAgo} minutes ago`;
    } else if (hoursAgo < 24) {
      relativeTime = `${hoursAgo} hours ago`;
    } else {
      relativeTime = `${daysAgo} days ago`;
    }

    // Update the content
    element.textContent = relativeTime;
  });
});

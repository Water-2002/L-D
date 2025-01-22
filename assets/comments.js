const storeName = 'l-d-technical-support-team';
const accessToken = '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';
const metafieldNamespace = "custom";
const metafieldKey = "comments"; 

async function getMetafield(productId) {
  const response = await fetch(
    `https://${storeName}.myshopify.com/admin/api/2023-01/products/${productId}/metafields.json`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken
      }
    }
  );

  const data = await response.json();
  const metafield = data.metafields.find(
    (field) => field.namespace === metafieldNamespace && field.key === metafieldKey
  );

  return metafield ? JSON.parse(metafield.value) : [];
}

async function appendMetaObject(metaObjectId) {
  const currentList = await getMetafield();

  // Append the new MetaObject ID
  currentList.push({ type: "metaobject", id: metaObjectId });

  return currentList;
}

async function updateMetafield(metafieldId, updatedList) {
  const response = await fetch(
    `https://${storeName}.myshopify.com/admin/api/2023-01/metafields/${metafieldId}.json`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken
      },
      body: JSON.stringify({
        metafield: {
          id: metafieldId,
          value: JSON.stringify(updatedList),
          type: "list.metaobject"
        }
      })
    }
  );

  if (response.ok) {
    const result = await response.json();
    console.log("Metafield updated successfully:", result);
  } else {
    const error = await response.json();
    console.error("Error updating metafield:", error);
  }
}

async function addMetaObjectToProduct(metaObjectId) {
  const metafield = await getMetafield();

  if (metafield) {
    const updatedList = await appendMetaObject(metaObjectId);
    await updateMetafield(metafield.id, updatedList);
  } else {
    console.error("Metafield not found for this product.");
  }
}

async function createMetaObject() {
  const metaObjectData = {
    metaobject: {
      type: "custom_type", // Replace with your MetaObject type
      fields: [
        {
          namespace: "custom",
          key: "color",
          value: "blue"
        },
        {
          namespace: "custom",
          key: "size",
          value: "large"
        }
      ]
    }
  };

  const response = await fetch(
    `https://${storeName}.myshopify.com/admin/api/2023-01/metaobjects.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken
      },
      body: JSON.stringify(metaObjectData)
    }
  );

  if (response.ok) {
    const result = await response.json();
    console.log("MetaObject created:", result.metaobject);
    return result.metaobject.id; // Returns the new MetaObject ID
  } else {
    const error = await response.json();
    console.error("Error creating MetaObject:", error);
    return null;
  }
}

const fetchMetaObject = async () => {
  const endpoint = `https://${storeName}.myshopify.com/admin/api/2025-01/graphql.json`;

  const query = `
        query {
          metaobjectByHandle(handle: "comment-ihqgkdq3", type:"comment") {
            id
            handle
            type
            
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
};

document.addEventListener("DOMContentLoaded", function () {
  let sbBtn = document.querySelector('.btn-submit');
  sbBtn.addEventListener('click', async () => {
    let productId = sbBtn.getAttribute('product-id')
    let rs = await getMetafield(productId);
    await fetchMetaObject();
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

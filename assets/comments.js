const storeName = 'l-d-technical-support-team';
const accessToken = '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';
const metafieldNamespace = "custom";
const metafieldKey = "comments"; 


const fetchMetaObject = async () => {
  const endpoint = `https://${storeName}.myshopify.com/admin/api/2025-01/graphql.json`;

  const query = `
        query {
           metaobjectByHandle(handle: { handle: "comment-ihqgkdq3", type: "comment" }) {
            id
            handle
            type
            fields {
              key
              value
            }
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


document.addEventListener("DOMContentLoaded", function () {
  let sbBtn = document.querySelector('.btn-submit');
  sbBtn.addEventListener('click', async () => {
    let productId = sbBtn.getAttribute('product-id');
    let content = document.querySelector('.comment-content').textContent;
    await fetchMetaObject();
    createMetaObject('comment', [
        { key: "owner", value: "gid://shopify/Metaobject/81172988147" },
        { key: "content", value: "This is a sample comment" },
        { key: "created_at", value: "2025-01-22T15:30:00Z" }
      ]).then(metaobject => console.log('Created MetaObject:', metaobject));
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

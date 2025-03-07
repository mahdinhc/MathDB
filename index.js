const owner = "mahdinhc";        
const repo = "MathDB";      
const branch = "main";   
const directory = "database"; 
const apiUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;

function buildJsTreeData(flatTree, directory) {
  const treeData = [];
  const dirPrefix = directory ? `${directory}/` : "";

  flatTree.forEach(item => {
    if (!item.path.startsWith(dirPrefix)) return;

    let relativePath = item.path.substring(dirPrefix.length); 
    if (!relativePath) return; 

    let parent = "#";
    if (relativePath.includes('/')) {
      parent = relativePath.substring(0, relativePath.lastIndexOf('/'));
      if (parent === "") {
        parent = "#";
      }
    }

    treeData.push({
      id: relativePath,
      parent: parent, 
      text: relativePath.split('/').pop(), 
      icon: item.type === 'tree' ? "jstree-folder" : "jstree-file"
    });
  });

  return treeData;
}

$(document).ready(function() {
  $.getJSON(apiUrl, function(data) {
    if (data && data.tree) {
      const treeData = buildJsTreeData(data.tree, directory);
      $('#repoTree').jstree({
        'core': {
          'data': treeData,
          'themes': {
            'icons': true
          }
        }
      });
    }
  }).fail(function(jqXHR, textStatus, errorThrown) {
    console.error("Error fetching GitHub repository tree:", textStatus, errorThrown);
    $('#repoTree').html('<p>Error fetching repository tree data. Please check the repository details and try again.</p>');
  });
});

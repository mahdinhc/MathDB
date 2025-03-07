const owner = "mahdinhc";        
const repo = "MathDB";      
const branch = "main";   
const directory = "database"; 
const apiUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;

function getBasename(path) {
  const base = path.split(/[\\/]/).pop();
  const dotIndex = base.lastIndexOf('.');
  return dotIndex > 0 ? base.substring(0, dotIndex) : base;
}

// Example usage:
console.log(getBasename("C:\\folder\\subfolder\\file.txt")); // Output: "file"
console.log(getBasename("/usr/local/bin/script.js"));         // Output: "script"
console.log(getBasename("example"));                           // Output: "example"


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
			const treeData = buildJsTreeData(data.tree, directory)
			console.log(treeData)
			$('#repoTree').jstree({
				core: {
					data: treeData
				}
			}).on('redraw.jstree', function () {
				$('.jstree-anchor').each(function(){
					var nodeText = $(this).text()
					nodeText = getBasename(nodeText)
					console.log(nodeText)
					$(this).html(asciimath.parseMath(nodeText))
				})
			})
		}
	})
	.fail(function(jqXHR, textStatus, errorThrown) {
		$('#repoTree').html('<p>Error fetching repository tree data. Please check the repository details and try again.</p>')
	})
})

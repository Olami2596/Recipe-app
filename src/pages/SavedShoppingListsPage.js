import React, { useState, useEffect, useRef } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  orderBy,
} from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, Table, TableRow, TableCell } from "docx";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import html2canvas from "html2canvas";

function SavedShoppingListsPage() {
  const [savedLists, setSavedLists] = useState([]);
  const [editingList, setEditingList] = useState(null);
  const { user } = useAuth();
  const shoppingListRef = useRef(null);

  useEffect(() => {
    fetchSavedLists();
  }, [user.uid]);

  const fetchSavedLists = async () => {
    try {
      const q = query(
        collection(db, "shoppingLists"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const lists = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSavedLists(lists);
    } catch (error) {
      console.error("Error fetching saved shopping lists:", error);
      alert("Failed to fetch saved shopping lists. Please try again.");
    }
  };

  const handleEdit = (list) => {
    setEditingList({ ...list, items: [...list.items] });
  };

  const handleSave = async () => {
    try {
      const docRef = doc(db, "shoppingLists", editingList.id);
      await updateDoc(docRef, { items: editingList.items });
      setEditingList(null);
      fetchSavedLists();
      alert("Shopping list updated successfully!");
    } catch (error) {
      console.error("Error updating shopping list:", error);
      alert("Failed to update shopping list. Please try again.");
    }
  };

  const handleDelete = async (listId) => {
    if (window.confirm("Are you sure you want to delete this shopping list?")) {
      try {
        await deleteDoc(doc(db, "shoppingLists", listId));
        fetchSavedLists();
        alert("Shopping list deleted successfully!");
      } catch (error) {
        console.error("Error deleting shopping list:", error);
        alert("Failed to delete shopping list. Please try again.");
      }
    }
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...editingList.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setEditingList({ ...editingList, items: updatedItems });
  };

  const exportToDOCX = (list) => {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph("Shopping List"),
            new Table({
              rows: list.items.map(
                (item) =>
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph(item.name)] }),
                      new TableCell({
                        children: [new Paragraph(item.count.toString())],
                      }),
                    ],
                  })
              ),
            }),
          ],
        },
      ],
    });

    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, `shopping_list_${list.id}.docx`);
    });
  };

  const exportToExcel = (list) => {
    const ws = XLSX.utils.json_to_sheet(list.items);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Shopping List");
    XLSX.writeFile(wb, `shopping_list_${list.id}.xlsx`);
  };

  const exportToPDF = (list) => {
    const doc = new jsPDF();
    doc.text("Shopping List", 10, 10);
    doc.autoTable({
      head: [["Item", "Count"]],
      body: list.items.map((item) => [item.name, item.count]),
    });
    doc.save(`shopping_list_${list.id}.pdf`);
  };

  const exportToImage = async () => {
    const element = shoppingListRef.current;
    const canvas = await html2canvas(element);
    const dataURL = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "shopping_list.png";
    link.click();
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-olive-800 mb-6 text-center">
        Saved Shopping Lists
      </h1>
      <Link
        to="/shopping-list"
        className="inline-block bg-olive-800 text-white px-6 py-2 rounded hover:bg-olive-600 mb-6"
      >
        Back to Shopping List
      </Link>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {savedLists.map((list) => (
          <div
            ref={shoppingListRef}
            key={list.id}
            className="border bg-olive-50 border-olive-200 p-4 rounded-md shadow-md transition-transform transform hover:scale-105 hover:shadow-lg duration-300 ease-in-out"
          >
            <h2 className="text-xl font-semibold text-olive-800 mb-2">
              Shopping List{" "}
              {new Date(list.createdAt.seconds * 1000).toLocaleString()}
            </h2>
            {editingList && editingList.id === list.id ? (
              <div>
                {editingList.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center mb-2"
                  >
                    <input
                      value={item.name}
                      onChange={(e) =>
                        handleItemChange(index, "name", e.target.value)
                      }
                      className="border border-olive-800 p-2 rounded w-2/3"
                    />
                    <input
                      type="number"
                      value={item.count}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          "count",
                          parseInt(e.target.value)
                        )
                      }
                      className="border border-olive-800 p-2 rounded w-1/3"
                    />
                  </div>
                ))}
                <button
                  onClick={handleSave}
                  className="bg-olive-800 text-white px-4 py-2 rounded hover:bg-olive-600"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditingList(null)}
                  className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 ml-4"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div>
                <ul className="list-disc ml-5 mb-4">
                  {list.items.map((item, index) => (
                    <li key={index}>
                      {item.name} (x{item.count})
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleEdit(list)}
                  className="bg-olive-800 text-white px-4 py-2 rounded hover:bg-olive-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(list.id)}
                  className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 ml-4"
                >
                  Delete
                </button>
                <h3 className="text-lg font-semibold text-olive-700 mt-4">
                  Export Options:
                </h3>
                <div className="flex space-x-4 mt-2">
                  <button
                    onClick={() => exportToDOCX(list)}
                    className="bg-olive-800 text-white px-4 py-2 rounded hover:bg-olive-600 "
                  >
                    DOCX
                  </button>
                  <button
                    onClick={() => exportToExcel(list)}
                    className="bg-olive-800 text-white px-4 py-2 rounded hover:bg-olive-600 "
                  >
                    Excel
                  </button>
                  <button
                    onClick={() => exportToPDF(list)}
                    className="bg-olive-800 text-white px-4 py-2 rounded hover:bg-olive-600 "
                  >
                    PDF
                  </button>
                  <button
                    onClick={exportToImage}
                    className="bg-olive-800 text-white px-4 py-2 rounded hover:bg-olive-600 "
                  >
                    Image
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SavedShoppingListsPage;

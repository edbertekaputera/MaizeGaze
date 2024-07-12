import React, { useState } from 'react';
import { Button, Modal } from "flowbite-react";
import BBoxAnnotator from './BBoxAnnotator';

const ReannotateModal = ({ isOpen, onRequestClose, imageUrl, annotationsData, onSave }) => {
    const [annotations, setAnnotations] = useState(annotationsData || []);

    const handleSave = () => {
        onSave(annotations);
        onRequestClose();
    };

    return (
        <Modal show={isOpen} onClose={onRequestClose} size="6xl">
            <Modal.Header>Re-annotate</Modal.Header>
            <Modal.Body>
                <div style={{ overflow: 'auto', maxHeight: '80vh' }}>
                    <BBoxAnnotator
                        imageUrl={imageUrl}
                        annotationsData={annotations}
                        onChange={setAnnotations}
                    />
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={handleSave} className="bg-custom-green-1 hover:bg-custom-green-2">
                    Save changes
                </Button>
                <Button onClick={onRequestClose} className="bg-red-500 hover:bg-red-800">
                    Cancel
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ReannotateModal;


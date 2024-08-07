from uuid import uuid4
# Libraries
from flask import current_app
from typing_extensions import Self 
from sqlalchemy import func
from datetime import datetime

from .sqlalchemy import db

class Feedback(db.Model):
    __tablename__ = "Feedback"
    
    feedback_id = db.Column(db.String(250), primary_key=True, default=lambda: str(uuid4()))
    rating = db.Column(db.Integer, nullable=False)
    content = db.Column(db.String(1000), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=func.now())
    
    # Foreign key
    user_email = db.Column(db.String(250), db.ForeignKey("User.email"), nullable=False)
    
    # Relationship
    feedbackToUserRel = db.relationship("User", back_populates="userToFeedbackRel")    
        
    @classmethod
    def create(cls, details:dict) -> bool:
        try:
            with current_app.app_context():
                new_result = cls(**details)
                db.session.add(new_result)
                db.session.commit()
            return True
        except BaseException as e:
            print(e)
            return False
    
    @classmethod
    def query_all_feedback(cls) -> list[Self]:
        return cls.query.order_by(cls.created_at.desc()).all()
    
    @classmethod
    def filter(cls, rating:int) -> Self|None:
        return cls.query.filter_by(rating=rating).one_or_none()
    
    @classmethod
    def get(cls, feedback_id:str) -> Self|None:
        return cls.query.filter_by(feedback_id=feedback_id).one_or_none()
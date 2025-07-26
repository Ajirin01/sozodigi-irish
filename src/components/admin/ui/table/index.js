import React from "react";
import PropTypes from "prop-types";

// Table Component
const Table = ({ children, className }) => {
  return <table className={`min-w-full ${className}`}>{children}</table>;
};

Table.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

// TableHeader Component
const TableHeader = ({ children, className }) => {
  return <thead className={className}>{children}</thead>;
};

TableHeader.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

// TableBody Component
const TableBody = ({ children, className }) => {
  return <tbody className={className}>{children}</tbody>;
};

TableBody.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

// TableRow Component
const TableRow = ({ children, className }) => {
  return <tr className={className}>{children}</tr>;
};

TableRow.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

// TableCell Component
const TableCell = ({ children, isHeader = false, className }) => {
  const CellTag = isHeader ? "th" : "td";
  return <CellTag className={className}>{children}</CellTag>;
};

TableCell.propTypes = {
  children: PropTypes.node.isRequired,
  isHeader: PropTypes.bool,
  className: PropTypes.string,
};

export { Table, TableHeader, TableBody, TableRow, TableCell };
